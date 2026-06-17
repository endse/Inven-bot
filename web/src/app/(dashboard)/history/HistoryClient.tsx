"use client"
import { useState } from "react"
import { deleteInvoiceDraft, updateInvoiceDraft } from "./actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FileText, Pencil, Trash2, Check, X, Box } from "lucide-react"

export default function HistoryClient({ initialDrafts }: { initialDrafts: any[] }) {
  const router = useRouter()
  const [drafts, setDrafts] = useState(initialDrafts)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const [editingDraft, setEditingDraft] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [zoom, setZoom] = useState(1)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice? All associated transactions will be removed from your inventory.")) return;
    setDeletingId(id)
    try {
      await deleteInvoiceDraft(id)
      setDrafts(drafts.filter(d => d.id !== id))
      toast.success("Invoice and associated transactions deleted.")
      router.refresh()
    } catch (err) {
      toast.error("Failed to delete invoice")
    }
    setDeletingId(null)
  }

  const handleEditOpen = (draft: any) => {
    setEditingDraft(draft)
    setZoom(1)
    setEditForm(draft.transactions.map((t: any) => ({
      id: t.id,
      quantity: Number(t.quantity),
      rate: Number(t.rate || 0)
    })))
  }

  const handleEditSave = async () => {
    setIsSaving(true)
    try {
      await updateInvoiceDraft(editForm)
      
      const updatedDrafts = drafts.map(d => {
        if (d.id === editingDraft.id) {
          return {
            ...d,
            transactions: d.transactions.map((t: any) => {
              const updated = editForm.find(ef => ef.id === t.id)
              return updated ? { ...t, quantity: updated.quantity, rate: updated.rate } : t
            })
          }
        }
        return d
      })
      setDrafts(updatedDrafts)
      setEditingDraft(null)
      toast.success("Invoice transactions successfully updated.")
      router.refresh()
    } catch (err) {
      toast.error("Failed to save changes")
    }
    setIsSaving(false)
  }

  if (editingDraft) {
    return (
      <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6 lg:gap-8 items-start animate-in fade-in zoom-in-95 duration-300">
        <div className="w-full lg:w-5/12 h-[30vh] lg:h-full border rounded-2xl bg-slate-100 flex flex-col relative overflow-hidden shadow-sm group shrink-0">
          <div className="absolute top-4 left-4 z-10">
            <button 
              onClick={() => setEditingDraft(null)}
              className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border shadow-sm text-sm font-medium hover:bg-white flex items-center gap-2 transition-colors"
            >
              <X className="h-4 w-4" /> <span className="hidden sm:inline">Close</span>
            </button>
          </div>
          <div className="absolute top-4 right-4 z-10 flex gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border opacity-100 lg:opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="px-2 hover:bg-slate-100 rounded text-sm font-medium h-8">-</button>
            <div className="px-2 py-1 text-sm font-semibold flex items-center justify-center min-w-[3.5rem]">{Math.round(zoom * 100)}%</div>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="px-2 hover:bg-slate-100 rounded text-sm font-medium h-8">+</button>
            <div className="w-px h-5 bg-slate-200 my-auto mx-1" />
            <button onClick={() => setZoom(1)} className="px-2 hover:bg-slate-100 rounded text-sm font-medium text-slate-500 h-8">Reset</button>
          </div>
          <div className="flex-1 overflow-auto p-4 cursor-grab active:cursor-grabbing flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`/api/images/${editingDraft.id}`} 
              alt="Invoice" 
              className="shadow-sm transition-transform duration-200 rounded" 
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            />
          </div>
        </div>
        
        <div className="w-full lg:w-7/12 flex flex-col h-[50vh] lg:h-full bg-white border rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b bg-slate-50/80 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div>
              <h2 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                Edit Transactions <Pencil className="h-5 w-5 text-indigo-500" />
              </h2>
              <p className="text-sm text-slate-500 mt-1">Update quantities and rates to correct your inventory.</p>
            </div>
            <button 
              onClick={handleEditSave}
              disabled={isSaving}
              className="w-full sm:w-auto justify-center bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? "Saving..." : <><Check className="h-4 w-4" /> Save Changes</>}
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
            {editingDraft.transactions.map((tx: any, idx: number) => {
              const formItem = editForm.find(ef => ef.id === tx.id)
              if (!formItem) return null
              
              return (
                <div key={tx.id} className="p-4 sm:p-5 border rounded-2xl shadow-sm bg-white hover:shadow-md transition-all group">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    <Box className="h-4 w-4 text-indigo-400" /> Item {idx + 1} • <span className="font-mono">ID: {tx.productId.slice(0, 8)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Quantity</label>
                      <input 
                        type="number" 
                        value={formItem.quantity}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          setEditForm(editForm.map(ef => ef.id === tx.id ? { ...ef, quantity: val } : ef))
                        }}
                        className="w-full border-transparent bg-slate-50 focus:bg-white focus:border-primary focus:ring-primary/20 rounded-xl px-4 py-2.5 font-medium transition-all outline-none border"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Rate ($)</label>
                      <input 
                        type="number" 
                        value={formItem.rate}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          setEditForm(editForm.map(ef => ef.id === tx.id ? { ...ef, rate: val } : ef))
                        }}
                        className="w-full border-transparent bg-slate-50 focus:bg-white focus:border-primary focus:ring-primary/20 rounded-xl px-4 py-2.5 font-medium transition-all outline-none border"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {drafts.map(draft => {
        const totalItems = draft.transactions.length
        const totalAmount = draft.transactions.reduce((sum: number, t: any) => sum + (Number(t.quantity) * Number(t.rate || 0)), 0)
        
        return (
          <div key={draft.id} className="group border bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col relative">
            <div className="h-48 bg-slate-100 overflow-hidden relative border-b">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/images/${draft.id}`} alt="Invoice" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
                {new Date(draft.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col bg-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className={`h-4 w-4 ${draft.transactionType === "purchase" ? "text-emerald-500" : "text-blue-500"}`} />
                    {draft.transactionType === "purchase" ? "Purchase" : "Sale"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{totalItems} items recorded</p>
                </div>
                <div className="text-right bg-slate-50 px-3 py-1.5 rounded-lg border">
                  <span className="font-bold text-slate-800">₹{totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>
              
              <div className="mt-auto flex gap-3">
                <button 
                  onClick={() => handleEditOpen(draft)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button 
                  onClick={async () => {
                    const email = window.prompt("Enter email address to send this bill to:");
                    if (!email) return;
                    try {
                      const { queueGeneratedBillEmail } = await import('../email-actions');
                      await queueGeneratedBillEmail(draft.id, email);
                      toast.success("Bill queued for emailing!");
                    } catch (e: any) {
                      toast.error("Failed to queue email: " + e.message);
                    }
                  }}
                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  title="Email PDF"
                >
                  <FileText className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(draft.id)}
                  disabled={deletingId === draft.id}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> {deletingId === draft.id ? '...' : ''}
                </button>
              </div>
            </div>
          </div>
        )
      })}
      
      {drafts.length === 0 && (
        <div className="col-span-full py-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No history found</h3>
          <p className="text-slate-500">Processed invoices will appear here.</p>
        </div>
      )}
    </div>
  )
}
