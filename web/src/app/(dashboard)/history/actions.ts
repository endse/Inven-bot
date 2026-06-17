"use server"

import { prisma } from "@/lib/prisma"

export async function deleteInvoiceDraft(id: string) {
  // Cascading deletes in Prisma will automatically remove all associated Transaction records
  await prisma.invoiceDraft.delete({
    where: { id }
  })
}
