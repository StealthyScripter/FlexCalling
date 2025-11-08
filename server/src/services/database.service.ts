import { PrismaClient } from '@prisma/client';
import type { User, Contact, CallHistoryRecord } from '../types';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

class DatabaseService {
  // ============================================
  // DATABASE CONNECTION
  // ============================================

  async connect() {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    await prisma.$disconnect();
  }

  async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  // ============================================
  // USERS
  // ============================================

  async getUser(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user as User | null;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { phone },
    });
    return user as User | null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user as User | null;
  }

  async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = await prisma.user.create({
      data: userData,
    });
    return user as User;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updates,
      });
      return user as User;
    } catch (error) {
      return null;
    }
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<User | null> {
    return this.updateUser(userId, { balance: newBalance });
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // ============================================
  // ADMIN - USER MANAGEMENT
  // ============================================

  async getAllUsers(options: {
    skip?: number;
    take?: number;
    role?: 'USER' | 'ADMIN';
    search?: string;
  }): Promise<{ users: User[]; total: number }> {
    const { skip = 0, take = 20, role, search } = options;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users as User[],
      total,
    };
  }

  async getPlatformStats() {
    const [
      totalUsers,
      totalAdmins,
      totalCalls,
      totalRevenue,
      activeUsersCount,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.callHistory.count(),
      prisma.callHistory.aggregate({
        _sum: { cost: true },
      }),
      prisma.user.count({
        where: {
          role: 'USER',
          balance: { gt: 0 },
        },
      }),
    ]);

    // Get call volume by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCalls = await prisma.callHistory.groupBy({
      by: ['date'],
      where: {
        date: { gte: sevenDaysAgo },
      },
      _count: true,
    });

    return {
      users: {
        total: totalUsers,
        admins: totalAdmins,
        active: activeUsersCount,
      },
      calls: {
        total: totalCalls,
        recentByDay: recentCalls.map(r => ({
          date: r.date,
          count: r._count,
        })),
      },
      revenue: {
        total: totalRevenue._sum.cost || 0,
        currency: 'USD',
      },
    };
  }

  async getAllCallHistory(options: {
    skip?: number;
    take?: number;
    userId?: string;
  }): Promise<{ calls: CallHistoryRecord[]; total: number }> {
    const { skip = 0, take = 50, userId } = options;

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const [calls, total] = await Promise.all([
      prisma.callHistory.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          contact: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take,
        orderBy: { date: 'desc' },
      }),
      prisma.callHistory.count({ where }),
    ]);

    return {
      calls: calls.map((call): CallHistoryRecord => ({
        id: call.id,
        callSid: call.callSid,
        from: call.from,
        to: call.to,
        direction: call.direction as 'incoming' | 'outgoing',
        status: call.status as any,
        date: call.date,
        startTime: call.startTime,
        endTime: call.endTime,
        duration: call.duration,
        cost: call.cost,
        ratePerMinute: call.ratePerMinute,
        contactName: call.contact?.name,
        contactId: call.contact?.id,
        location: call.location || undefined,
        recordingUrl: call.recordingUrl || undefined,
      })),
      total,
    };
  }

  async getUserCallStats(userId: string) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const [totalCalls, completedCalls, totalCost, callsByMonth] = await Promise.all([
      prisma.callHistory.count({ where: { userId } }),
      prisma.callHistory.count({
        where: { userId, status: 'completed' },
      }),
      prisma.callHistory.aggregate({
        where: { userId },
        _sum: { cost: true },
      }),
      prisma.callHistory.groupBy({
        by: ['date'],
        where: { userId },
        _count: true,
        _sum: { cost: true, duration: true },
        orderBy: { date: 'desc' },
        take: 30,
      }),
    ]);

    return {
      totalCalls,
      completedCalls,
      totalSpent: totalCost._sum.cost || 0,
      totalDuration: user.totalCallDuration,
      averageCallDuration:
        completedCalls > 0 ? Math.round(user.totalCallDuration / completedCalls) : 0,
      currentBalance: user.balance,
      callsByDay: callsByMonth.map(c => ({
        date: c.date,
        count: c._count,
        totalCost: c._sum.cost || 0,
        totalDuration: c._sum.duration || 0,
      })),
    };
  }

  // ============================================
  // CONTACTS (unchanged, with user scoping)
  // ============================================

  async getContacts(userId: string): Promise<Contact[]> {
    const contacts = await prisma.contact.findMany({
      where: { userId },
      orderBy: [
        { favorite: 'desc' },
        { name: 'asc' },
      ],
    });
    return contacts as Contact[];
  }

  async getContact(userId: string, contactId: string): Promise<Contact | null> {
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        userId,
      },
    });
    return contact as Contact | null;
  }

  async getContactByPhone(userId: string, phone: string): Promise<Contact | null> {
    const contact = await prisma.contact.findFirst({
      where: {
        userId,
        phone,
      },
    });
    return contact as Contact | null;
  }

  async createContact(userId: string, contactData: Omit<Contact, 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const contact = await prisma.contact.create({
      data: {
        ...contactData,
        userId,
      },
    });
    return contact as Contact;
  }

  async updateContact(
    userId: string,
    contactId: string,
    updates: Partial<Contact>
  ): Promise<Contact | null> {
    try {
      const contact = await prisma.contact.updateMany({
        where: {
          id: contactId,
          userId,
        },
        data: updates,
      });

      if (contact.count === 0) return null;

      return this.getContact(userId, contactId);
    } catch (error) {
      return null;
    }
  }

  async deleteContact(userId: string, contactId: string): Promise<boolean> {
    try {
      const result = await prisma.contact.deleteMany({
        where: {
          id: contactId,
          userId,
        },
      });
      return result.count > 0;
    } catch (error) {
      return false;
    }
  }

  // ============================================
  // CALL HISTORY (with user scoping)
  // ============================================

  async getCallHistory(userId: string, limit: number = 50): Promise<CallHistoryRecord[]> {
    const records = await prisma.callHistory.findMany({
      where: { userId },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return records.map((record): CallHistoryRecord => ({
      id: record.id,
      callSid: record.callSid,
      from: record.from,
      to: record.to,
      direction: record.direction as 'incoming' | 'outgoing',
      status: record.status as any,
      date: record.date,
      startTime: record.startTime,
      endTime: record.endTime,
      duration: record.duration,
      cost: record.cost,
      ratePerMinute: record.ratePerMinute,
      contactName: record.contact?.name,
      contactId: record.contact?.id,
      location: record.location || undefined,
      recordingUrl: record.recordingUrl || undefined,
    }));
  }

  async getCallHistoryForContact(userId: string, contactPhone: string): Promise<CallHistoryRecord[]> {
    const records = await prisma.callHistory.findMany({
      where: {
        userId,
        OR: [
          { from: contactPhone },
          { to: contactPhone },
        ],
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return records.map((record): CallHistoryRecord => ({
      id: record.id,
      callSid: record.callSid,
      from: record.from,
      to: record.to,
      direction: record.direction as 'incoming' | 'outgoing',
      status: record.status as any,
      date: record.date,
      startTime: record.startTime,
      endTime: record.endTime,
      duration: record.duration,
      cost: record.cost,
      ratePerMinute: record.ratePerMinute,
      contactName: record.contact?.name,
      contactId: record.contact?.id,
      location: record.location || undefined,
      recordingUrl: record.recordingUrl || undefined,
    }));
  }

  async createCallRecord(recordData: CallHistoryRecord): Promise<CallHistoryRecord> {
    const user = await this.getUserByPhone(recordData.from) ||
                 await this.getUserByPhone(recordData.to);

    if (!user) {
      throw new Error('User not found for call record');
    }

    const record = await prisma.callHistory.create({
      data: {
        id: recordData.id,
        callSid: recordData.callSid,
        from: recordData.from,
        to: recordData.to,
        direction: recordData.direction,
        status: recordData.status,
        date: recordData.date,
        startTime: recordData.startTime,
        endTime: recordData.endTime,
        duration: recordData.duration,
        cost: recordData.cost,
        ratePerMinute: recordData.ratePerMinute,
        location: recordData.location,
        recordingUrl: recordData.recordingUrl,
        userId: user.id,
        contactId: recordData.contactId,
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      ...recordData,
      contactName: record.contact?.name,
      contactId: record.contact?.id,
    };
  }
}

export const db = new DatabaseService();
export { prisma };
