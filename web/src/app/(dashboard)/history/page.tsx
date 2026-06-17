import { prisma } from "@/lib/prisma"
import HistoryClient from "./HistoryClient"

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const approvedDrafts = await prisma.invoiceDraft.findMany({
    where: { status: "approved" },
    select: { id: true, transactionType: true, status: true, extractedData: true, createdAt: true, updatedAt: true, transactions: true },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoice History</h1>
      </div>
      
      {approvedDrafts.length === 0 ? (
        <div className="border border-dashed rounded-lg p-12 text-center bg-slate-50">
          <p className="text-slate-500 text-lg">No processed invoices found.</p>
        </div>
      ) : (
        <HistoryClient initialDrafts={approvedDrafts} />
      )}
    </div>
  )
}
