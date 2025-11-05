import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://flexcalling:flexcalling_dev_password@localhost:5432/flexcalling_test?schema=public',
    },
  },
});

async function globalTeardown() {
  console.log('\n🧹 Cleaning up test database...\n');

  try {
    // Clean all test data
    await prisma.callHistory.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Test database cleaned\n');
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export default globalTeardown;
