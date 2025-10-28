/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/**
 * Get display name (contact name or phone number)
 */
export function getDisplayName(contactName?: string, phoneNumber?: string): string {
  return contactName || phoneNumber || 'Unknown';
}

/**
 * Get first initial for avatar
 */
export function getFirstInitial(name: string): string {
  return name[0]?.toUpperCase() || '?';
}

/**
 * Generate avatar color based on name
 */
export function generateAvatarColor(name: string): string {
  const colors = ['#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

/**
 * Extract contact info from call
 */
export function extractContactInfo(phone: string, contacts: any[]) {
  const contact = contacts.find(c => c.phone === phone);

  if (contact) {
    return {
      name: contact.name,
      avatar: contact.avatarColor,
      initial: getInitials(contact.name),
      isContact: true,
    };
  }

  return {
    name: phone,
    avatar: '#8B5CF6',
    initial: phone[0] || '?',
    isContact: false,
  };
}
