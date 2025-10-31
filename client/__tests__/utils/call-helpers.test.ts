import {
  getCallTypeColor,
  getCallTypeIcon,
  getCallTypeLabel,
  getCallStateInfo,
  calculateCallCost,
} from '@/utils/call-helpers';

describe('Call Helpers', () => {
  describe('getCallTypeColor', () => {
    test('should return correct color for outgoing', () => {
      expect(getCallTypeColor('outgoing')).toBe('#10B981');
    });

    test('should return correct color for incoming', () => {
      expect(getCallTypeColor('incoming')).toBe('#3B82F6');
    });

    test('should return correct color for missed', () => {
      expect(getCallTypeColor('missed')).toBe('#EF4444');
    });

    test('should return default color for unknown', () => {
      expect(getCallTypeColor('unknown')).toBe('#6B7280');
    });
  });

  describe('getCallTypeIcon', () => {
    test('should return correct icon for outgoing', () => {
      expect(getCallTypeIcon('outgoing')).toBe('phone.arrow.up.right.fill');
    });

    test('should return correct icon for incoming', () => {
      expect(getCallTypeIcon('incoming')).toBe('phone.arrow.down.left.fill');
    });

    test('should return correct icon for missed', () => {
      expect(getCallTypeIcon('missed')).toBe('phone.down.fill');
    });

    test('should return default icon for unknown', () => {
      expect(getCallTypeIcon('unknown')).toBe('phone.fill');
    });
  });

  describe('getCallTypeLabel', () => {
    test('should return correct label for outgoing', () => {
      expect(getCallTypeLabel('outgoing')).toBe('Outgoing Call');
    });

    test('should return correct label for incoming', () => {
      expect(getCallTypeLabel('incoming')).toBe('Incoming Call');
    });

    test('should return correct label for missed', () => {
      expect(getCallTypeLabel('missed')).toBe('Missed Call');
    });

    test('should return default label for unknown', () => {
      expect(getCallTypeLabel('unknown')).toBe('Call');
    });
  });

  describe('getCallStateInfo', () => {
    test('should return info for pending state', () => {
      const info = getCallStateInfo('pending');
      expect(info.text).toBe('Calling...');
      expect(info.color).toBe('#F59E0B');
      expect(info.showDuration).toBe(false);
    });

    test('should return info for connecting state', () => {
      const info = getCallStateInfo('connecting');
      expect(info.text).toBe('Calling...');
      expect(info.showDuration).toBe(false);
    });

    test('should return info for ringing state', () => {
      const info = getCallStateInfo('ringing');
      expect(info.text).toBe('Ringing...');
      expect(info.color).toBe('#3B82F6');
    });

    test('should return info for connected state', () => {
      const info = getCallStateInfo('connected');
      expect(info.text).toBe('Connected');
      expect(info.color).toBe('#10B981');
      expect(info.showDuration).toBe(true);
    });

    test('should return info for reconnecting state', () => {
      const info = getCallStateInfo('reconnecting');
      expect(info.text).toBe('Reconnecting...');
      expect(info.showDuration).toBe(false);
    });

    test('should return info for unknown state', () => {
      const info = getCallStateInfo('unknown');
      expect(info.text).toBe('Unknown');
      expect(info.color).toBe('#6B7280');
    });
  });

  describe('calculateCallCost', () => {
    test('should calculate cost correctly', () => {
      const cost = calculateCallCost(120, 0.05); // 2 minutes at $0.05/min
      expect(cost).toBe(0.10);
    });

    test('should handle fractional minutes', () => {
      const cost = calculateCallCost(90, 0.05); // 1.5 minutes
      expect(cost).toBeCloseTo(0.075, 3);
    });

    test('should handle zero duration', () => {
      const cost = calculateCallCost(0, 0.05);
      expect(cost).toBe(0);
    });

    test('should handle different rates', () => {
      const cost = calculateCallCost(60, 0.10); // 1 minute at $0.10/min
      expect(cost).toBe(0.10);
    });
  });
});