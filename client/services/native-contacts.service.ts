import * as Contacts from 'expo-contacts';
import { Platform } from 'react-native';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

// Import with alias to avoid naming conflict
import type { Contact as AppContact } from '@/types';

/**
 * Native Contact - from device phone contacts
 */
export interface NativeContact {
  id: string; // Prefixed with 'native_'
  name: string;
  phone: string; // Formatted E.164
  email?: string;
  avatarColor: string;
  favorite: boolean;
  isNativeContact: true; // Flag to distinguish from AppContacts
  rawPhoneNumber: string; // Original unformatted number
}

export class NativeContactsService {
  private static readonly AVATAR_COLORS = [
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#10B981', // Green
    '#F59E0B', // Amber
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];

  // Counter for generating unique IDs
  private static contactCounter = 0;

  /**
   * Check if contacts permission is granted
   */
  static async hasPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('Contacts not available on web');
      return false;
    }

    try {
      const { status } = await Contacts.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Request contacts permission
   */
  static async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const { status } = await Contacts.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      return false;
    }
  }

  /**
   * Fetch all contacts from device
   */
  static async fetchContacts(): Promise<NativeContact[]> {
    if (Platform.OS === 'web') {
      console.log('Contacts not available on web');
      return [];
    }

    try {
      // Check permission
      const hasPermission = await this.hasPermission();
      if (!hasPermission) {
        const granted = await this.requestPermission();
        if (!granted) {
          throw new Error('Contacts permission denied');
        }
      }

      // Reset counter for fresh fetch
      this.contactCounter = 0;

      // Fetch contacts
      console.log('📱 Fetching native contacts...');
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      console.log(`📱 Found ${data.length} contacts on device`);

      // Transform and filter contacts
      const transformedContacts = data
        .filter(contact => this.hasValidPhoneNumber(contact))
        .map((contact, index) => this.transformContact(contact, index))
        .filter((contact): contact is NativeContact => contact !== null);

      console.log(`✅ Processed ${transformedContacts.length} valid contacts`);
      return transformedContacts;

    } catch (error) {
      console.error('❌ Error fetching native contacts:', error);
      throw error;
    }
  }

  /**
   * Check if contact has at least one valid phone number
   */
  private static hasValidPhoneNumber(contact: Contacts.Contact): boolean {
    return !!(
      contact.phoneNumbers &&
      contact.phoneNumbers.length > 0 &&
      contact.phoneNumbers[0].number
    );
  }

  /**
   * Generate unique ID for contact
   */
  private static generateContactId(contact: Contacts.Contact, index: number): string {
    // Cast to any to safely access potential id properties
    const contactAny = contact as any;

    // Try to get ID from various possible properties
    let baseId: string;

    if (contactAny.id) {
      baseId = String(contactAny.id);
    } else if (contactAny.contactId) {
      baseId = String(contactAny.contactId);
    } else {
      // Generate unique ID based on contact data
      const timestamp = Date.now();
      this.contactCounter++;
      baseId = `${timestamp}_${index}_${this.contactCounter}`;
    }

    return `native_${baseId}`;
  }

  /**
   * Transform native contact to app format
   */
  private static transformContact(contact: Contacts.Contact, index: number): NativeContact | null {
    try {
      const phoneNumbers = contact.phoneNumbers || [];

      // Get the first valid phone number
      let validPhone: string | null = null;
      let rawPhone = '';

      for (const phoneData of phoneNumbers) {
        const phone = phoneData.number;
        if (!phone) continue;

        rawPhone = phone;
        const formatted = this.formatPhoneNumber(phone);

        if (formatted && isValidPhoneNumber(formatted)) {
          validPhone = formatted;
          break;
        }
      }

      if (!validPhone) {
        return null;
      }

      // Get contact name
      const name = this.getContactName(contact);

      // Generate unique ID
      const uniqueId = this.generateContactId(contact, index);

      return {
        id: uniqueId,
        name,
        phone: validPhone,
        rawPhoneNumber: rawPhone,
        email: contact.emails?.[0]?.email,
        avatarColor: this.generateAvatarColor(name),
        favorite: false,
        isNativeContact: true,
      };

    } catch (error) {
      console.error('Error transforming contact:', error);
      return null;
    }
  }

  /**
   * Get display name for contact
   */
  private static getContactName(contact: Contacts.Contact): string {
    if (contact.name) {
      return contact.name;
    }

    if (contact.firstName || contact.lastName) {
      return [contact.firstName, contact.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
    }

    return 'Unknown Contact';
  }

  /**
   * Format phone number to E.164 format
   * Assumes Kenya (+254) as default country
   */
  private static formatPhoneNumber(phone: string): string | null {
    try {
      // Remove all non-digit characters except +
      let cleaned = phone.replace(/[^\d+]/g, '');

      // If already has country code, validate and return
      if (cleaned.startsWith('+')) {
        const parsed = parsePhoneNumber(cleaned);
        return parsed?.number || null;
      }

      // Handle Kenya-specific formatting
      // Remove leading 0
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }

      // Add Kenya country code (+254)
      if (cleaned.length === 9) {
        // Standard Kenya mobile number (9 digits after 0)
        const formatted = '+254' + cleaned;

        // Validate the formatted number
        if (isValidPhoneNumber(formatted, 'KE')) {
          return formatted;
        }
      }

      // Try parsing with Kenya as default country
      const parsed = parsePhoneNumber(cleaned, 'KE');
      return parsed?.number || null;

    } catch (error) {
      console.error('Error formatting phone number:', phone, error);
      return null;
    }
  }

  /**
   * Generate consistent avatar color based on name
   */
  private static generateAvatarColor(name: string): string {
    const charCode = name.charCodeAt(0) || 0;
    return this.AVATAR_COLORS[charCode % this.AVATAR_COLORS.length];
  }

  /**
   * Search contacts by name or phone
   */
  static searchContacts(contacts: NativeContact[], query: string): NativeContact[] {
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
      return contacts;
    }

    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(lowerQuery) ||
      contact.phone.includes(lowerQuery) ||
      contact.rawPhoneNumber.includes(lowerQuery)
    );
  }

  /**
   * Merge native contacts with backend contacts
   * Removes duplicates based on phone number
   */
  static mergeContacts(
    backendContacts: AppContact[],
    nativeContacts: NativeContact[]
  ): (AppContact | NativeContact)[] {
    const backendPhones = new Set(
      backendContacts.map(c => c.phone.replace(/\D/g, ''))
    );

    // Filter out native contacts that already exist in backend
    const uniqueNativeContacts = nativeContacts.filter(contact => {
      const cleanPhone = contact.phone.replace(/\D/g, '');
      return !backendPhones.has(cleanPhone);
    });

    // Backend contacts first (they have more info), then unique native contacts
    return [...backendContacts, ...uniqueNativeContacts];
  }

  /**
   * Get contact statistics
   */
  static getStats(contacts: NativeContact[]) {
    const totalContacts = contacts.length;
    const withEmail = contacts.filter(c => c.email).length;
    const uniqueNumbers = new Set(contacts.map(c => c.phone)).size;

    return {
      total: totalContacts,
      withEmail,
      uniqueNumbers,
      duplicates: totalContacts - uniqueNumbers,
    };
  }

  /**
   * Type guard to check if contact is from native device
   */
  static isNativeContact(
    contact: AppContact | NativeContact
  ): contact is NativeContact {
    return 'isNativeContact' in contact && contact.isNativeContact === true;
  }

  /**
   * Type guard to check if contact is from app backend
   */
  static isAppContact(
    contact: AppContact | NativeContact
  ): contact is AppContact {
    return !this.isNativeContact(contact);
  }
}
