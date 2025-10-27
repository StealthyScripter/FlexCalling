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
