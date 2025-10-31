import {
  getInitials,
  getDisplayName,
  getFirstInitial,
  generateAvatarColor,
} from '@/utils/contact-helpers';

describe('Contact Helpers', () => {
  describe('getInitials', () => {
    test('should get initials from single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    test('should get initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    test('should get initials from three names', () => {
      expect(getInitials('John Michael Doe')).toBe('JMD');
    });

    test('should handle lowercase names', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    test('should handle extra spaces', () => {
      expect(getInitials('John  Doe')).toBe('JD');
    });
  });

  describe('getDisplayName', () => {
    test('should return contact name if available', () => {
      expect(getDisplayName('John Doe', '+254712345678')).toBe('John Doe');
    });

    test('should return phone number if no contact name', () => {
      expect(getDisplayName(undefined, '+254712345678')).toBe('+254712345678');
    });

    test('should return "Unknown" if no data', () => {
      expect(getDisplayName(undefined, undefined)).toBe('Unknown');
    });

    test('should prefer contact name over phone', () => {
      expect(getDisplayName('Alice', '+254712345678')).toBe('Alice');
    });
  });

  describe('getFirstInitial', () => {
    test('should get first initial', () => {
      expect(getFirstInitial('John')).toBe('J');
    });

    test('should uppercase first initial', () => {
      expect(getFirstInitial('john')).toBe('J');
    });

    test('should handle empty string', () => {
      expect(getFirstInitial('')).toBe('?');
    });

    test('should handle numbers', () => {
      expect(getFirstInitial('+254712345678')).toBe('+');
    });
  });

  describe('generateAvatarColor', () => {
    test('should generate consistent color for same name', () => {
      const color1 = generateAvatarColor('John');
      const color2 = generateAvatarColor('John');
      expect(color1).toBe(color2);
    });

    test('should generate different colors for different names', () => {
      const color1 = generateAvatarColor('Alice');
      const color2 = generateAvatarColor('Bob');
      // High probability of different colors
      expect(color1).not.toBe(color2);
    });

    test('should return valid hex color', () => {
      const color = generateAvatarColor('Test');
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    test('should be one of predefined colors', () => {
      const colors = ['#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];
      const color = generateAvatarColor('Test');
      expect(colors).toContain(color);
    });
  });
});
