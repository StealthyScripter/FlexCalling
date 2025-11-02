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
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { phone },
    });
  }

  async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    return await prisma.user.create({
      data: userData,
    });
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: updates,
      });
    } catch (error) {
      return null;
    }
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<User | null> {
    return this.updateUser(userId, { balance: newBalance });
  }

  // ============================================
  // CONTACTS
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
  // CALL HISTORY
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
    // Find the user by phone number to get userId
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

  // ============================================
  // SEED DATA
  // ============================================

  async seedData() {
    try {
      // Check if data already exists
      const existingUser = await prisma.user.findFirst();
      if (existingUser) {
        console.log('📊 Database already seeded');
        return;
      }

      console.log('🌱 Seeding database...');

      // Create default user
      const user = await prisma.user.create({
        data: {
          id: '1',
          name: 'James Doe',
          phone: '+19191234567',
          email: 'james.doe@example.com',
          balance: 25.0,
        },
      });

      // Create default contacts
      await prisma.contact.createMany({
        data: [
          {
            id: '1',
            name: 'Alice Johnson',
            phone: '+254712345678',
            email: 'alice@example.com',
            location: 'Nairobi, Kenya',
            favorite: true,
            avatarColor: '#EC4899',
            userId: user.id,
          },
          {
            id: '2',
            name: 'Bob Williams',
            phone: '+254722456789',
            location: 'Mombasa, Kenya',
            favorite: false,
            avatarColor: '#3B82F6',
            userId: user.id,
          },
          {
            id: '3',
            name: 'Carol Davis',
            phone: '+254734564890',
            location: 'Kisumu, Kenya',
            favorite: true,
            avatarColor: '#F59E0B',
            userId: user.id,
          },
        ],
      });

      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }
}

export const db = new DatabaseService();
export { prisma };
