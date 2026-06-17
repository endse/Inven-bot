import { prisma } from "@/lib/prisma"
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ClearQueueButton } from "./ClearQueueButton"

export const dynamic = 'force-dynamic';

export default async function GenerateHistoryPage() {
  const queueItems = await prisma.generateQueue.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <Link href="/generate-sales">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Generation Queue History</h1>
            <p className="text-sm text-slate-500 mt-1">Track the status of your automated bill generation requests</p>
          </div>
        </div>
        <ClearQueueButton />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {queueItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Clock className="h-12 w-12 opacity-20 mb-4" />
            <p>No generation requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount Range</th>
                  <th className="px-6 py-4">Attempts</th>
                  <th className="px-6 py-4">Next Retry / Time</th>
                  <th className="px-6 py-4">Error / Info</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {queueItems.map((item) => {
                  let StatusIcon = Clock;
                  let statusColor = "text-slate-500";
                  let bgStatus = "bg-slate-100";
                  
                  if (item.status === "completed") {
                    StatusIcon = CheckCircle;
                    statusColor = "text-emerald-600";
                    bgStatus = "bg-emerald-100";
                  } else if (item.status === "failed") {
                    StatusIcon = XCircle;
                    statusColor = "text-red-600";
                    bgStatus = "bg-red-100";
                  } else if (item.status === "processing") {
                    StatusIcon = Loader2;
                    statusColor = "text-blue-600";
                    bgStatus = "bg-blue-100";
                  } else if (item.status === "pending") {
                    StatusIcon = RefreshCw;
                    statusColor = "text-amber-600";
                    bgStatus = "bg-amber-100";
                  }

                  const isDelayed = item.status === "pending" && new Date(item.nextRetryAt).getTime() > new Date().getTime();

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor} ${bgStatus}`}>
                          <StatusIcon className={`h-3.5 w-3.5 ${item.status === 'processing' ? 'animate-spin' : ''}`} />
                          <span className="capitalize">{item.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        ${item.minAmount} - ${item.maxAmount}
                      </td>
                      <td className="px-6 py-4">
                        {item.attempts}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {isDelayed ? (
                          <span className="text-amber-600 font-medium">
                            Will retry around {new Date(item.nextRetryAt).toLocaleTimeString()}
                          </span>
                        ) : (
                          new Date(item.createdAt).toLocaleString()
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-500">
                        {item.errorMessage ? (
                          <div className="flex items-center gap-1.5 text-red-500" title={item.errorMessage}>
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.errorMessage}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
