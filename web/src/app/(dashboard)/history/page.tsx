import { prisma } from "@/lib/prisma"
import HistoryClient from "./HistoryClient"

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const draftsData = await prisma.invoiceDraft.findMany({
    where: { status: "approved" },
    select: { id: true, transactionType: true, status: true, extractedData: true, createdAt: true, updatedAt: true, transactions: true },
    orderBy: { createdAt: "desc" }
  })

  // Serialize Decimal to numbers to pass to Client Component
  const approvedDrafts = draftsData.map(draft => ({
    ...draft,
    extractedData: draft.extractedData as any,
    transactions: draft.transactions.map(t => ({
      ...t,
      quantity: t.quantity.toNumber(),
      rate: t.rate?.toNumber() ?? null,
      amount: t.amount?.toNumber() ?? null
    }))
  }))

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
