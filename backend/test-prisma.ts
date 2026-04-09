import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.$connect()
  .then(() => console.log('Connected natively!'))
  .catch(err => {
    console.error('NATIVE ERROR:', err.message);
  });
