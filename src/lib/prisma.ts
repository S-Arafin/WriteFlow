import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = (): PrismaClient => {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

declare global {
  var prismaGlobal: undefined | PrismaClient;
}

const prisma: PrismaClient = global.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}
