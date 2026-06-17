"use client"
import { useState } from "react"
import { deleteInvoiceDraft } from "./actions"
import { useRouter } from "next/navigation"

export default function HistoryClient({ initialDrafts }: { initialDrafts: any[] }) {
  const router = useRouter()
  const [drafts, setDrafts] = useState(initialDrafts)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice? All associated transactions will be removed from your inventory.")) return;
    setDeletingId(id)
    try {
      await deleteInvoiceDraft(id)
      setDrafts(drafts.filter(d => d.id !== id))
      router.refresh()
    } catch (err) {
      alert("Failed to delete invoice")
    }
    setDeletingId(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drafts.map(draft => {
        const totalItems = draft.transactions.length
        const totalAmount = draft.transactions.reduce((sum: number, t: any) => sum + (Number(t.quantity) * Number(t.rate || 0)), 0)
        
        return (
          <div key={draft.id} className="border bg-white rounded-lg overflow-hidden shadow-sm flex flex-col">
            <div className="h-48 bg-slate-100 overflow-hidden relative border-b">
              <img src={draft.imageUrl} alt="Invoice" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                {new Date(draft.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{draft.transactionType === "purchase" ? "Purchase Invoice" : "Sales Invoice"}</h3>
                  <p className="text-sm text-slate-500">{totalItems} items extracted</p>
                </div>
                <div className="text-right">
                  <span className="font-medium text-green-600">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-auto pt-4 flex gap-2">
                <button 
                  onClick={() => alert('Edit mode allows you to tweak individual line items. Implementation coming soon!')}
                  className="flex-1 px-3 py-1.5 border rounded text-sm font-medium hover:bg-slate-50 transition-colors text-slate-700"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(draft.id)}
                  disabled={deletingId === draft.id}
                  className="px-3 py-1.5 border border-red-200 text-red-600 rounded text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deletingId === draft.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
