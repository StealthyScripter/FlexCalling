import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Hash passwords
  const userPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Create default regular user
  const user = await prisma.user.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'James Doe',
      phone: '+19191234567',
      email: 'james.doe@example.com',
      password: userPassword,
      balance: 25.0,
      isVerified: true,
      role: 'USER',
      totalCallDuration: 0,
    },
  });

  console.log(`✅ Created user: ${user.name}`);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flexcalling.com' },
    update: {},
    create: {
      id: '2',
      name: 'Admin User',
      phone: '+19192223333',
      email: 'admin@flexcalling.com',
      password: adminPassword,
      balance: 0, // Admins don't need balance
      isVerified: true,
      role: 'ADMIN',
      totalCallDuration: 0,
    },
  });

  console.log(`✅ Created admin: ${admin.name}`);

  // Create default contacts for the regular user
  const contacts = [
    {
      id: '1',
      name: 'Alice Johnson',
      phone: '+254712345678',
      email: 'alice@example.com',
      location: 'Nairobi, Kenya',
      favorite: true,
      avatarColor: '#EC4899',
      userId: user.id,
    },
    {
      id: '2',
      name: 'Bob Williams',
      phone: '+254722456789',
      location: 'Mombasa, Kenya',
      favorite: false,
      avatarColor: '#3B82F6',
      userId: user.id,
    },
    {
      id: '3',
      name: 'Carol Davis',
      phone: '+254734564890',
      location: 'Kisumu, Kenya',
      favorite: true,
      avatarColor: '#F59E0B',
      userId: user.id,
    },
  ];

  for (const contact of contacts) {
    await prisma.contact.upsert({
      where: { id: contact.id },
      update: {},
      create: contact,
    });
  }

  console.log(`✅ Created ${contacts.length} contacts`);
  console.log('\n📋 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━');
  console.log('Regular User:');
  console.log('  Email: james.doe@example.com');
  console.log('  Password: password123');
  console.log('\nAdmin User:');
  console.log('  Email: admin@flexcalling.com');
  console.log('  Password: admin123');
  console.log('━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
