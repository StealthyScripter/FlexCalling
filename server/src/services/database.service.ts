import type { User, Contact, CallHistoryRecord } from '../types';

// In-memory database (replace with PostgreSQL/MongoDB in production)
class DatabaseService {
  private users: Map<string, User> = new Map();
  private contacts: Map<string, Contact> = new Map();
  private callHistory: Map<string, CallHistoryRecord> = new Map();
  private userContacts: Map<string, Set<string>> = new Map(); // userId -> contactIds

  constructor() {
    this.seedData();
  }

  // ============================================
  // USERS
  // ============================================

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    this.userContacts.set(user.id, new Set());
    return user;
  }

  updateUser(userId: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(userId);
    if (!user) return undefined;

    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(userId, updated);
    return updated;
  }

  updateUserBalance(userId: string, newBalance: number): User | undefined {
    return this.updateUser(userId, { balance: newBalance });
  }

  // ============================================
  // CONTACTS
  // ============================================

  getContacts(userId: string): Contact[] {
    const contactIds = this.userContacts.get(userId) || new Set();
    return Array.from(contactIds)
      .map(id => this.contacts.get(id))
      .filter((c): c is Contact => c !== undefined)
      .sort((a, b) => {
        // Sort favorites first, then alphabetically
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return a.name.localeCompare(b.name);
      });
  }

  getContact(userId: string, contactId: string): Contact | undefined {
    const contactIds = this.userContacts.get(userId);
    if (!contactIds?.has(contactId)) return undefined;
    return this.contacts.get(contactId);
  }

  getContactByPhone(userId: string, phone: string): Contact | undefined {
    const contacts = this.getContacts(userId);
    return contacts.find(c => c.phone === phone);
  }

  createContact(userId: string, contact: Contact): Contact {
    this.contacts.set(contact.id, contact);
    const userContactIds = this.userContacts.get(userId) || new Set();
    userContactIds.add(contact.id);
    this.userContacts.set(userId, userContactIds);
    return contact;
  }

  updateContact(userId: string, contactId: string, updates: Partial<Contact>): Contact | undefined {
    const contact = this.getContact(userId, contactId);
    if (!contact) return undefined;

    const updated = { ...contact, ...updates, updatedAt: new Date() };
    this.contacts.set(contactId, updated);
    return updated;
  }

  deleteContact(userId: string, contactId: string): boolean {
    const contactIds = this.userContacts.get(userId);
    if (!contactIds?.has(contactId)) return false;

    contactIds.delete(contactId);
    this.contacts.delete(contactId);
    return true;
  }

  // ============================================
  // CALL HISTORY
  // ============================================

  getCallHistory(userId: string, limit: number = 50): CallHistoryRecord[] {
    return Array.from(this.callHistory.values())
      .filter(call => {
        const user = this.users.get(userId);
        return user && (call.from === user.phone || call.to === user.phone);
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  getCallHistoryForContact(userId: string, contactPhone: string): CallHistoryRecord[] {
    const user = this.users.get(userId);
    if (!user) return [];

    return Array.from(this.callHistory.values())
      .filter(call =>
        (call.from === user.phone && call.to === contactPhone) ||
        (call.to === user.phone && call.from === contactPhone)
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  createCallRecord(record: CallHistoryRecord): CallHistoryRecord {
    this.callHistory.set(record.id, record);
    return record;
  }

  // ============================================
  // SEED DATA
  // ============================================

  private seedData() {
    // Create default user
    const defaultUser: User = {
      id: '1',
      name: 'James Doe',
      phone: '+19191234567',
      email: 'james.doe@example.com',
      balance: 25.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.createUser(defaultUser);

    // Create default contacts
    const defaultContacts: Contact[] = [
      {
        id: '1',
        name: 'Alice Johnson',
        phone: '+254712345678',
        email: 'alice@example.com',
        location: 'Nairobi, Kenya',
        favorite: true,
        avatarColor: '#EC4899',
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'Bob Williams',
        phone: '+254722456789',
        location: 'Mombasa, Kenya',
        favorite: false,
        avatarColor: '#3B82F6',
        createdAt: new Date(),
      },
      {
        id: '3',
        name: 'Carol Davis',
        phone: '+254734564890',
        location: 'Kisumu, Kenya',
        favorite: true,
        avatarColor: '#F59E0B',
        createdAt: new Date(),
      },
    ];

    defaultContacts.forEach(contact => this.createContact(defaultUser.id, contact));
  }
}

export const db = new DatabaseService();
