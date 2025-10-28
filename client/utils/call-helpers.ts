import type { EnrichedCallLog, CallDirection } from '@/types';
import type { SymbolViewProps } from 'expo-symbols';

/**
 * Get color for call type/direction
 */
export function getCallTypeColor(direction: CallDirection | string): string {
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
export function getCallTypeIcon(direction: CallDirection | string): SymbolViewProps['name'] {
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
export function getCallTypeLabel(direction: CallDirection | string): string {
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

/**
 * Get call state display information
 */
export function getCallStateInfo(state?: string) {
  switch (state) {
    case 'pending':
      return { text: 'Calling...', color: '#F59E0B', showDuration: false };
    case 'connecting':
      return { text: 'Calling...', color: '#F59E0B', showDuration: false };
    case 'ringing':
      return { text: 'Ringing...', color: '#3B82F6', showDuration: false };
    case 'connected':
      return { text: 'Connected', color: '#10B981', showDuration: true };
    case 'reconnecting':
      return { text: 'Reconnecting...', color: '#F59E0B', showDuration: false };
    default:
      return { text: 'Unknown', color: '#6B7280', showDuration: false };
  }
}

/**
 * Calculate call cost
 */
export function calculateCallCost(durationSeconds: number, ratePerMinute: number): number {
  return (durationSeconds / 60) * ratePerMinute;
}