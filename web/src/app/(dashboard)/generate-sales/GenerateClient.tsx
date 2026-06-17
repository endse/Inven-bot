"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Check, RefreshCw, DollarSign, Package, Trash2, LayoutList, History } from "lucide-react"
import { queueGenerateBillAction, approveBillAction, deleteBillAction } from "./actions"
import { toast } from "sonner"
import Link from "next/link"

const RANGES = [
  { id: "small", label: "Small Bill", min: 500, max: 1000 },
  { id: "medium", label: "Medium Bill", min: 1000, max: 3000 },
  { id: "large", label: "Large Bill", min: 3000, max: 5000 },
]

export default function GenerateClient({ initialDrafts = [] }: { initialDrafts?: any[] }) {
  const [selectedRange, setSelectedRange] = useState(RANGES[1])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null)
  
  const activeDraft = initialDrafts?.find(d => d.id === activeDraftId)
  const generatedData = activeDraft?.extractedData

  // Poll queue every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/process-queue').catch(e => console.error(e));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      await queueGenerateBillAction(selectedRange.min, selectedRange.max)
      toast.success("Generation request added to queue!")
    } catch (err: any) {
      toast.error(err.message || "Failed to generate bill")
    }
    setIsGenerating(false)
  }

  const handleApprove = async () => {
    if (!activeDraft || !generatedData) return;
    setIsSaving(true)
    try {
      await approveBillAction(activeDraft.id, generatedData.items)
      toast.success("Bill approved and transactions recorded!")
      setActiveDraftId(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to save bill")
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(id)
    try {
      await deleteBillAction(id)
      toast.success("Discarded auto-generated bill")
      if (activeDraftId === id) setActiveDraftId(null)
    } catch (err: any) {
      toast.error("Failed to delete bill")
    }
    setIsDeleting(null)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative animate-in fade-in zoom-in-95 duration-300">
      
      {/* Configuration & Queue Panel */}
      <div className="w-full lg:w-4/12 flex flex-col gap-6 shrink-0">
        
        {/* Generator Box */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sparkles className="h-32 w-32" />
          </div>
          
          <h2 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" /> Generate New Bill
          </h2>
          
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 gap-3">
              {RANGES.map(range => (
                <button
                  key={range.id}
                  onClick={() => setSelectedRange(range)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedRange.id === range.id 
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className={`font-semibold ${selectedRange.id === range.id ? 'text-primary' : 'text-slate-700'}`}>
                    {range.label}
                  </span>
                  <span className={`text-sm font-medium ${selectedRange.id === range.id ? 'text-primary' : 'text-slate-500'}`}>
                    ${range.min} - ${range.max}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || isSaving}
            className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-indigo-500/20 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 transition-all active:scale-[0.98]"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2"><RefreshCw className="h-5 w-5 animate-spin" /> Queuing...</span>
            ) : (
              <span className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Queue Magic Bill</span>
            )}
          </Button>

          <Link href="/generate-sales/history" className="w-full">
            <Button variant="outline" className="w-full h-12 rounded-xl font-medium mt-3 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <History className="h-4 w-4 mr-2" /> View Generation Queue History
            </Button>
          </Link>
          
          <div className="mt-3 text-center text-xs font-medium text-slate-400">
            {initialDrafts.length} / 5 Pending Review
          </div>
        </div>
        
        {/* Queue List Box */}
        {initialDrafts.length > 0 && (
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[500px]">
             <div className="p-4 bg-slate-50 border-b flex items-center gap-2 font-bold text-slate-700">
               <LayoutList className="h-5 w-5 text-indigo-400" /> Pending Queue
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {initialDrafts.map((draft: any) => (
                  <div 
                    key={draft.id}
                    onClick={() => setActiveDraftId(draft.id)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${activeDraftId === draft.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-slate-100 hover:border-primary/30 hover:bg-slate-50'}`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-800">${Number(draft.extractedData?.totalAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                      <div className="text-xs font-medium text-slate-500">{draft.extractedData?.items?.length || 0} items</div>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(draft.id, e)}
                      disabled={isDeleting === draft.id}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div className="w-full lg:w-8/12 flex flex-col min-h-[500px] bg-white border rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b bg-slate-50/80 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div>
            <h2 className="font-bold text-slate-800 text-xl flex items-center gap-2">
              Preview <DollarSign className="h-5 w-5 text-emerald-500" />
            </h2>
            <p className="text-sm text-slate-500 mt-1">Review the AI-generated bundle before approving.</p>
          </div>
          {generatedData && (
            <Button 
              onClick={handleApprove}
              disabled={isSaving}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? "Saving..." : <><Check className="h-4 w-4" /> Approve & Record Sales</>}
            </Button>
          )}
        </div>
        
        <div className="flex-1 p-6 bg-slate-50/30">
          {!generatedData ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4 py-20">
              <Package className="h-16 w-16 opacity-20" />
              <p>Generate a new bill or select one from the queue to preview.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-xl border p-6 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Bill Amount</div>
                  <div className="text-3xl font-black text-slate-800">${generatedData.totalAmount?.toLocaleString(undefined, {minimumFractionDigits: 2}) || 0}</div>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                    <tr>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4 text-center">Qty</th>
                      <th className="px-6 py-4 text-right">Rate</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {generatedData.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-700">{item.product_name}</td>
                        <td className="px-6 py-4 text-center font-mono">{item.quantity}</td>
                        <td className="px-6 py-4 text-right">${Number(item.rate).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800">${Number(item.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  )
}
