import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Hash password for seed user
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create default user
  const user = await prisma.user.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'James Doe',
      phone: '+19191234567',
      email: 'james.doe@example.com',
      password: hashedPassword,
      balance: 25.0,
      isVerified: true,
    },
  });

  console.log(`✅ Created user: ${user.name}`);

  // Create default contacts
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
  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
