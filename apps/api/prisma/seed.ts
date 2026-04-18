import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const org = await prisma.organization.create({
    data: {
      name: 'Demo Company',
      gstin: '29AABCT1234A1Z5',
      pan: 'AABCT1234A',
      stateCode: '29',
    },
  });

  const user = await prisma.user.create({
    data: {
      orgId: org.id,
      email: 'admin@demo.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log('Created organization:', org.name);
  console.log('Created user:', user.email);
  console.log('Password: password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());