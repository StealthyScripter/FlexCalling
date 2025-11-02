import app from './app';
import { config } from './config';
import { db } from './services/database.service';

const PORT = config.port;

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await db.connect();

    // Verify database
    await verifyDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log('\n🚀 FlexCalling Backend Server');
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
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Verify database connection
async function verifyDatabase() {
  try {
    const user = await db.getUser('1');
    const contacts = await db.getContacts('1');

    console.log('\n🔍 Database Verification:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ User loaded: ${user?.name || 'None'}`);
    console.log(`✅ Contacts loaded: ${contacts.length}`);
    console.log('✅ Database is operational');
    console.log('━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    throw error;
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} signal received: closing server gracefully`);

  try {
    await db.disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();
