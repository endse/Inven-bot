"use server"

import { prisma } from "@/lib/prisma"

async function getAllUserEmails() {
  const users = await prisma.user.findMany({
    where: { 
      OR: [{ status: 'APPROVED' }, { role: 'ADMIN' }],
      email: { not: '' }
    },
    select: { email: true }
  });
  return users.map((u: any) => u.email).filter(Boolean);
}

export async function queueMonthlyInventoryEmail(month: string, recipient?: string) {
  if (!month) throw new Error("Month is required");
  
  const allUserEmails = await getAllUserEmails();
  const allRecipients = Array.from(new Set([
    ...(recipient ? [recipient] : []),
    ...allUserEmails
  ]));

  await prisma.emailQueue.createMany({
    data: allRecipients.map(email => ({
      type: "monthly_inventory",
      payload: { month },
      recipient: email,
      status: "pending"
    }))
  });

  return { success: true };
}

export async function queueGeneratedBillEmail(draftId: string, recipient?: string) {
  if (!draftId) throw new Error("Draft ID is required");

  const allUserEmails = await getAllUserEmails();
  const allRecipients = Array.from(new Set([
    ...(recipient ? [recipient] : []),
    ...allUserEmails
  ]));

  await prisma.emailQueue.createMany({
    data: allRecipients.map(email => ({
      type: "generated_bill",
      payload: { draftId },
      recipient: email,
      status: "pending"
    }))
  });

  return { success: true };
}
