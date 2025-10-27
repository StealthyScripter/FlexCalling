import { EnrichedCallLog } from '@/services/api.service';

/**
 * Get color for call type/direction
 */
export function getCallTypeColor(direction: string): string {
  switch (direction) {
    case 'outgoing':
      return '#10B981';
    case 'incoming':
      return '#3B82F6';
    case 'missed':
      return '#EF4444';
    default:
      return '#6B7280';
  }
}

/**
 * Get icon name for call type/direction
 */
export function getCallTypeIcon(direction: string): string {
  switch (direction) {
    case 'outgoing':
      return 'phone.arrow.up.right.fill';
    case 'incoming':
      return 'phone.arrow.down.left.fill';
    case 'missed':
      return 'phone.down.fill';
    default:
      return 'phone.fill';
  }
}

/**
 * Get human-readable label for call type/direction
 */
export function getCallTypeLabel(direction: string): string {
  switch (direction) {
    case 'outgoing':
      return 'Outgoing Call';
    case 'incoming':
      return 'Incoming Call';
    case 'missed':
      return 'Missed Call';
    default:
      return 'Call';
  }
}

/**
 * Get call properties for UI rendering
 */
export function getCallProperties(call: EnrichedCallLog) {
  const direction = call.call?.direction || 'unknown';
  return {
    color: getCallTypeColor(direction),
    icon: getCallTypeIcon(direction),
    label: getCallTypeLabel(direction),
  };
}
