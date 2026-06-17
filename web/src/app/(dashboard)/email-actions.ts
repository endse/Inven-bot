"use server"

import { prisma } from "@/lib/prisma"

export async function queueMonthlyInventoryEmail(month: string, recipient: string) {
  if (!month || !recipient) throw new Error("Month and recipient are required");
  
  await prisma.emailQueue.create({
    data: {
      type: "monthly_inventory",
      payload: { month },
      recipient,
      status: "pending"
    }
  });

  return { success: true };
}

export async function queueGeneratedBillEmail(draftId: string, recipient: string) {
  if (!draftId || !recipient) throw new Error("Draft ID and recipient are required");

  await prisma.emailQueue.create({
    data: {
      type: "generated_bill",
      payload: { draftId },
      recipient,
      status: "pending"
    }
  });

  return { success: true };
}
