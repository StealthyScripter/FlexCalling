import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://flexcalling:flexcalling_dev_password@localhost:5432/flexcalling_test?schema=public',
    },
  },
});

async function globalSetup() {
  console.log('\n🧪 Setting up test database...\n');

  try {
    // Clean database
    await prisma.callHistory.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.user.deleteMany();

    // Seed user
    await prisma.user.create({
      data: {
        id: '1',
        name: 'James Doe',
        phone: '+19191234567',
        email: 'james.doe@example.com',
        balance: 25.0,
      },
    });

    // Seed contacts
    await prisma.contact.createMany({
      data: [
        {
          id: '1',
          name: 'Alice Johnson',
          phone: '+254712345678',
          email: 'alice@example.com',
          location: 'Nairobi, Kenya',
          favorite: true,
          avatarColor: '#EC4899',
          userId: '1',
        },
        {
          id: '2',
          name: 'Bob Williams',
          phone: '+254722456789',
          location: 'Mombasa, Kenya',
          favorite: false,
          avatarColor: '#3B82F6',
          userId: '1',
        },
        {
          id: '3',
          name: 'Carol Davis',
          phone: '+254734564890',
          location: 'Kisumu, Kenya',
          favorite: true,
          avatarColor: '#F59E0B',
          userId: '1',
        },
      ],
    });

    console.log('✅ Test database seeded successfully\n');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;
