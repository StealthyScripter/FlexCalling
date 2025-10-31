jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('expo-secure-store', () => ({
  __esModule: true,
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Test utilities
export const createMockContact = (overrides = {}) => ({
  id: '1',
  name: 'Test Contact',
  phone: '+254712345678',
  email: 'test@example.com',
  location: 'Nairobi, Kenya',
  favorite: false,
  avatarColor: '#EC4899',
  createdAt: new Date(),
  ...overrides,
});

export const createMockCallLog = (overrides = {}): any => ({
  call: {
    callSid: 'CA123456789',
    from: '+19191234567',
    to: '+254712345678',
    state: 'connected' as const,
    direction: 'outgoing' as const,
    isMuted: false,
    isOnHold: false,
  },
  incomingCallInvite: null,
  callStartTime: new Date(),
  callDuration: 120,
  ratePerMinute: 0.05,
  estimatedCost: 0.10,
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  phone: '+19191234567',
  email: 'test@example.com',
  balance: 25.0,
  ...overrides,
});
