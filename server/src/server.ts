import app from './app';
import { config } from './config';
import { db } from './services/database.service';

const PORT = config.port;

// Verify database on startup
function verifyDatabase() {
  try {
    const user = db.getUser('1');
    const contacts = db.getContacts('1');

    console.log('🔍 Database Verification:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ User loaded: ${user?.name || 'None'}`);
    console.log(`✅ Contacts loaded: ${contacts.length}`);
    console.log('✅ Database is operational');
    console.log('━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  }
}

app.listen(PORT, () => {
  console.log('🚀 FlexCalling Backend Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📚 Available endpoints:');
  console.log('  GET  /api/token');
  console.log('  GET  /api/users/:userId');
  console.log('  GET  /api/contacts');
  console.log('  GET  /api/calls/history');
  console.log('  POST /api/calls');
  console.log('  POST /api/voice/twiml');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Verify database after server starts
  verifyDatabase();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
