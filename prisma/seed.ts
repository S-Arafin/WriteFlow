import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Clear existing data
  await prisma.user.deleteMany({});

  // Seed Admin
  await prisma.user.create({
    data: {
      email: 'admin@writeflow.com',
      name: 'Admin User',
      role: 'ADMIN',
      plan: 'TEAM',
      hashedPassword,
    },
  });

  // Seed Standard User
  await prisma.user.create({
    data: {
      email: 'user@writeflow.com',
      name: 'Standard User',
      role: 'USER',
      plan: 'FREE',
      hashedPassword,
    },
  });

  console.log(
    'Seeding complete: admin@writeflow.com & user@writeflow.com created.'
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
