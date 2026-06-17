const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.emailQueue.create({
    data: {
      type: 'monthly_inventory',
      payload: { month: '2026-06' },
      recipient: 'chirag.yadav@example.com',
      status: 'pending'
    }
  });
  console.log('Created test email queue task');
}

main().catch(console.error).finally(() => prisma.$disconnect());
