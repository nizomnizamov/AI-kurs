import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('n11032001', 10);
  const email = 'nizomjonxudoyberdiyev25@gmail.com';
  
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: adminPassword,
      role: 'ADMIN',
      isApproved: true,
      isActive: true,
    },
    create: {
      email,
      passwordHash: adminPassword,
      firstName: 'Nizomjon',
      lastName: 'Xudoyberdiyev',
      role: 'ADMIN',
      isApproved: true,
      isActive: true,
    },
  });
  console.log('Admin created:', admin.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
