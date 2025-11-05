// Backend Verification Script (Node.js)
// Run with: node test-backend.js

const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

async function testEndpoint(name, method, endpoint, data = null, expectedStatus = 200) {
  process.stdout.write(`Testing: ${name}... `);
  
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const body = await response.text();
    
    if (response.status === expectedStatus) {
      console.log(`${colors.green}✓ PASSED${colors.reset} (Status: ${response.status})`);
      passed++;
      return { success: true, body: body ? JSON.parse(body) : null };
    } else {
      console.log(`${colors.red}✗ FAILED${colors.reset} (Expected: ${expectedStatus}, Got: ${response.status})`);
      console.log(`  Response: ${body}`);
      failed++;
      return { success: false, body: null };
    }
  } catch (error) {
    console.log(`${colors.red}✗ ERROR${colors.reset}: ${error.message}`);
    failed++;
    return { success: false, body: null };
  }
}

async function runTests() {
  console.log('🧪 FlexCalling Backend Verification');
  console.log('====================================\n');

  // 1. Health Checks
  console.log('📡 1. HEALTH CHECKS');
  console.log('-------------------');
  await testEndpoint('Basic Health Check', 'GET', '/health');
  await testEndpoint('Database Health Check', 'GET', '/health/db');
  console.log('');

  // 2. Token Generation
  console.log('🔑 2. TOKEN GENERATION');
  console.log('----------------------');
  await testEndpoint('Generate Token for User 1', 'GET', '/api/token');
  await testEndpoint('Generate Token with User ID', 'GET', '/api/token?userId=123');
  console.log('');

  // 3. User Operations
  console.log('👤 3. USER OPERATIONS');
  console.log('---------------------');
  await testEndpoint('Get User Profile', 'GET', '/api/users/1');
  await testEndpoint('Get Non-existent User', 'GET', '/api/users/nonexistent', null, 404);
  
  await testEndpoint('Update User Profile', 'PUT', '/api/users/1', {
    name: 'John Updated',
    email: 'updated@test.com'
  });
  
  await testEndpoint('Update User Balance', 'PUT', '/api/users/1/balance', {
    balance: 100.00
  });
  
  await testEndpoint('Reject Negative Balance', 'PUT', '/api/users/1/balance', {
    balance: -10
  }, 400);
  console.log('');

  // 4. Contact Operations
  console.log('📇 4. CONTACT OPERATIONS');
  console.log('------------------------');
  const contactsResult = await testEndpoint('Get All Contacts', 'GET', '/api/contacts?userId=1');
  
  let firstContactId = null;
  if (contactsResult.success && contactsResult.body?.data?.length > 0) {
    firstContactId = contactsResult.body.data[0].id;
    console.log(`  → Using contact ID: ${firstContactId}`);
  }
  
  if (firstContactId) {
    await testEndpoint('Get Specific Contact', 'GET', `/api/contacts/${firstContactId}?userId=1`);
  }
  
  await testEndpoint('Get Non-existent Contact', 'GET', '/api/contacts/nonexistent?userId=1', null, 404);
  
  const newContactId = `test-contact-${Date.now()}`;
  const createResult = await testEndpoint('Create New Contact', 'POST', '/api/contacts?userId=1', {
    id: newContactId,
    name: 'Test Contact',
    phone: '+254799999999',
    email: 'test@example.com',
    location: 'Test City',
    favorite: false,
    avatarColor: '#FF5733'
  }, 201);
  
  if (createResult.success) {
    await testEndpoint('Update Contact', 'PUT', `/api/contacts/${newContactId}?userId=1`, {
      name: 'Updated Contact',
      favorite: true
    });
    
    await testEndpoint('Delete Contact', 'DELETE', `/api/contacts/${newContactId}?userId=1`);
    await testEndpoint('Verify Contact Deleted', 'GET', `/api/contacts/${newContactId}?userId=1`, null, 404);
  }
  console.log('');

  // 5. Call Operations
  console.log('📞 5. CALL OPERATIONS');
  console.log('---------------------');
  await testEndpoint('Get Kenya Pricing', 'GET', '/api/calls/pricing/+254712345678');
  await testEndpoint('Get Default Pricing', 'GET', '/api/calls/pricing/+15551234567');
  
  await testEndpoint('Initiate Outbound Call', 'POST', '/api/calls', {
    to: '+254712345678',
    from: '+19191234567'
  });
  
  await testEndpoint('Reject Call Without Caller', 'POST', '/api/calls', {
    to: '+254712345678'
  }, 400);
  
  await testEndpoint('Get Call History', 'GET', '/api/calls/history?userId=1');
  await testEndpoint('Get Call History with Limit', 'GET', '/api/calls/history?userId=1&limit=5');
  await testEndpoint('Get Contact Call History', 'GET', '/api/calls/history/contact/+254712345678?userId=1');
  
  await testEndpoint('Save Call History', 'POST', '/api/calls/history?userId=1', {
    callSid: `CA${Date.now()}`,
    from: '+19191234567',
    to: '+254712345678',
    direction: 'outgoing',
    status: 'completed',
    date: new Date().toISOString(),
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 120000).toISOString(),
    duration: 120,
    cost: 0.10,
    ratePerMinute: 0.05
  }, 201);
  console.log('');

  // 6. Voice/TwiML Operations
  console.log('🔊 6. VOICE/TWIML OPERATIONS');
  console.log('----------------------------');
  await testEndpoint('Generate TwiML', 'POST', '/api/voice/twiml', {
    To: '+254712345678'
  });
  
  await testEndpoint('TwiML Without Destination', 'POST', '/api/voice/twiml', {}, 400);
  
  await testEndpoint('Handle Status Callback', 'POST', '/api/voice/status', {
    CallSid: 'CA123456789',
    CallStatus: 'completed',
    CallDuration: '120',
    From: '+19191234567',
    To: '+254712345678'
  });
  console.log('');

  // 7. Error Handling
  console.log('❌ 7. ERROR HANDLING');
  console.log('--------------------');
  await testEndpoint('Non-existent Route', 'GET', '/api/nonexistent', null, 404);
  console.log('');

  // Summary
  console.log('📊 SUMMARY');
  console.log('==========');
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log('');

  if (failed === 0) {
    console.log(`${colors.green}✓ All tests passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Some tests failed!${colors.reset}`);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (response.ok) {
      console.log(`${colors.green}✓ Server is running at ${BASE_URL}${colors.reset}\n`);
      return true;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Server is not running at ${BASE_URL}${colors.reset}`);
    console.log(`${colors.yellow}Please start the server with: npm run dev${colors.reset}\n`);
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  } else {
    process.exit(1);
  }
})();
