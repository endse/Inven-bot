"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { approveDraft, rejectDraft } from "../upload/actions"
import { toast } from "sonner"
import { Calendar, Package, ArrowRight, Zap, CheckCircle2, XCircle } from "lucide-react"

export default function ReviewClient({ initialDrafts }: { initialDrafts: any[] }) {
  const [drafts, setDrafts] = useState(initialDrafts)
  const [activeDraft, setActiveDraft] = useState<any | null>(null)
  const [zoom, setZoom] = useState(1);
  const [isApproving, setIsApproving] = useState(false);
  
  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">All caught up!</h2>
        <p className="text-slate-500 mt-2 max-w-sm">There are no pending invoices in the review queue. Upload new invoices via Telegram or the web portal.</p>
      </div>
    )
  }

  if (!activeDraft) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {drafts.map((draft) => (
          <div 
            key={draft.id} 
            onClick={() => setActiveDraft(draft)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30"
          >
            <div className="h-40 bg-slate-100 overflow-hidden relative border-b">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/images/${draft.id}`} alt="Invoice thumbnail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${draft.transactionType === 'purchase' ? 'bg-emerald-500/80' : 'bg-blue-500/80'}`}>
                  {draft.transactionType.toUpperCase()}
                </span>
                <span className="text-sm font-medium drop-shadow-md">
                  {draft.extractedData?.items?.length || 0} Items
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex items-center gap-2 text-slate-500 mb-4">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">{draft.extractedData?.invoice_date || "Date Unknown"}</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-400 font-mono">ID: {draft.id.slice(0,8)}</span>
                <div className="flex items-center text-primary text-sm font-semibold opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  Review <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Active Draft View
  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveDraft(activeDraft.id, activeDraft.extractedData);
      setDrafts(drafts.filter(d => d.id !== activeDraft.id));
      setActiveDraft(null);
      setZoom(1);
      toast.success("Invoice approved and transactions recorded!")
    } catch (e) {
      toast.error("Error approving draft. Please try again.")
    }
    setIsApproving(false);
  }

  const handleReject = async () => {
    try {
      await rejectDraft(activeDraft.id);
      setDrafts(drafts.filter(d => d.id !== activeDraft.id));
      setActiveDraft(null);
      setZoom(1);
      toast.success("Invoice rejected and removed from queue.")
    } catch (e) {
      toast.error("Error rejecting draft.")
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative pb-12 min-h-[calc(100vh-6rem)] animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full lg:w-5/12 h-[40vh] lg:h-full lg:sticky lg:top-0 border rounded-2xl bg-slate-100 flex flex-col overflow-hidden shadow-sm relative group shrink-0">
        <div className="absolute top-4 right-4 z-10 flex gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border opacity-100 lg:opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="sm" className="h-8 rounded-lg" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>-</Button>
          <div className="px-3 py-1 text-sm font-semibold flex items-center justify-center min-w-[3.5rem]">{Math.round(zoom * 100)}%</div>
          <Button variant="ghost" size="sm" className="h-8 rounded-lg" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>+</Button>
          <div className="w-px h-5 bg-slate-200 my-auto mx-1" />
          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-slate-500" onClick={() => setZoom(1)}>Reset</Button>
        </div>
        <div className="flex-1 overflow-auto p-4 cursor-grab active:cursor-grabbing flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={`/api/images/${activeDraft.id}`} 
            alt="Invoice" 
            className="shadow-sm transition-transform duration-200 rounded" 
            style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
          />
        </div>
      </div>

      <div className="w-full lg:w-7/12 flex flex-col h-[60vh] lg:h-full bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 border-b bg-slate-50/80 backdrop-blur-sm z-10 gap-4">
           <div className="flex items-center gap-3">
             <Button onClick={() => setActiveDraft(null)} variant="outline" className="rounded-xl h-10 shrink-0">← Back</Button>
             <div>
               <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                 Data Extraction <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
               </h2>
               <p className="text-xs font-mono text-slate-400">ID: {activeDraft.id.split('-')[0]}</p>
             </div>
           </div>
           <div className="flex gap-2 w-full sm:w-auto">
             <Button onClick={handleReject} variant="ghost" className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl h-10 px-5">Reject</Button>
             <Button onClick={handleApprove} disabled={isApproving} className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 rounded-xl h-10 px-6 shadow-md shadow-primary/20 whitespace-nowrap">
               {isApproving ? "Processing..." : "Approve & Save"}
             </Button>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 bg-slate-50/30">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border shadow-sm">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4" /> Invoice Date
            </label>
            <Input 
              className="max-w-full sm:max-w-md h-12 text-lg font-medium rounded-xl border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary"
              value={activeDraft.extractedData.invoice_date || ""} 
              onChange={e => setActiveDraft({...activeDraft, extractedData: {...activeDraft.extractedData, invoice_date: e.target.value}})} 
            />
          </div>

          <div>
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-500" /> Line Items ({activeDraft.extractedData.items.length})
            </h3>
            <div className="space-y-4">
              {activeDraft.extractedData.items.map((item: any, idx: number) => (
                <div key={idx} className="p-4 sm:p-5 border rounded-2xl shadow-sm bg-white transition-all hover:shadow-md group">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Product Name</label>
                      <Input 
                        className="rounded-xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:border-primary focus-visible:ring-primary/20 transition-all"
                        value={item.product_name} 
                        onChange={e => {
                          const newItems = [...activeDraft.extractedData.items];
                          newItems[idx].product_name = e.target.value;
                          setActiveDraft({...activeDraft, extractedData: {...activeDraft.extractedData, items: newItems}})
                        }} 
                      />
                    </div>
                    <div className="flex gap-4 sm:w-[200px]">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Qty</label>
                        <Input 
                          type="number" 
                          className="rounded-xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:border-primary transition-all text-center font-medium"
                          value={item.quantity} 
                          onChange={e => {
                            const newItems = [...activeDraft.extractedData.items];
                            const val = Number(e.target.value);
                            newItems[idx].quantity = val;
                            newItems[idx].amount = val * Number(newItems[idx].rate || 0);
                            setActiveDraft({...activeDraft, extractedData: {...activeDraft.extractedData, items: newItems}})
                          }} 
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Rate ($)</label>
                        <Input 
                          type="number" 
                          className="rounded-xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:border-primary transition-all font-medium text-right"
                          value={item.rate} 
                          onChange={e => {
                            const newItems = [...activeDraft.extractedData.items];
                            const val = Number(e.target.value);
                            newItems[idx].rate = val;
                            newItems[idx].amount = Number(newItems[idx].quantity || 0) * val;
                            setActiveDraft({...activeDraft, extractedData: {...activeDraft.extractedData, items: newItems}})
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="text-sm font-medium text-slate-600">
                      Total: ${(Number(item.quantity || 0) * Number(item.rate || 0)).toFixed(2)}
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">Action</span>
                      <select 
                        className="flex-1 sm:flex-none border-none bg-slate-100 rounded-lg p-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all hover:bg-slate-200 max-w-full"
                        value={item.action} 
                        onChange={e => {
                          const newItems = [...activeDraft.extractedData.items];
                          newItems[idx].action = e.target.value;
                          if (e.target.value === "use_existing") {
                            newItems[idx].productId = item.match?.suggestedProductId;
                          }
                          setActiveDraft({...activeDraft, extractedData: {...activeDraft.extractedData, items: newItems}})
                        }}
                      >
                        <option value="create_new">✨ Create New</option>
                        {item.match?.suggestedProductId && (
                          <option value="use_existing">🔗 Link: {item.match.suggestedProductName} ({item.match.similarityScore.toFixed(0)}%)</option>
                        )}
                        <option value="ignore">❌ Ignore</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
