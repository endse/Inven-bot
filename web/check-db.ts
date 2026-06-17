import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.emailQueue.findMany({ 
    where: { status: 'failed' },
    orderBy: { createdAt: 'desc' } 
  });
  console.log(JSON.stringify(tasks, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
