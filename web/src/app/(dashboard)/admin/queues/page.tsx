import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic';

export default async function AdminQueuesPage() {
  const uploadQueue = await prisma.uploadQueue.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
  const emailQueue = await prisma.emailQueue.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
  const generateQueue = await prisma.generateQueue.findMany({ orderBy: { createdAt: "desc" }, take: 50 })

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Background Queues</h1>
        <p className="text-muted-foreground mt-2">Monitor system background workers and task statuses.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upload Queue */}
        <Card className="col-span-full shadow-md">
          <CardHeader>
            <CardTitle>Upload Queue (OCR)</CardTitle>
            <CardDescription>Recent tasks from batch uploads and Telegram</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Draft ID</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Attempts</th>
                    <th className="px-4 py-3">Error</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadQueue.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-4 text-center text-muted-foreground">No recent tasks</td></tr>
                  ) : uploadQueue.map((t: any) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono text-xs">{t.id.slice(0,8)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.draftId.slice(0,8)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={getStatusColor(t.status)}>{t.status}</Badge>
                      </td>
                      <td className="px-4 py-3">{t.attempts}</td>
                      <td className="px-4 py-3 text-red-500 text-xs truncate max-w-[200px]">{t.errorMessage || '-'}</td>
                      <td className="px-4 py-3 text-xs">{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Email Queue */}
        <Card className="col-span-full shadow-md">
          <CardHeader>
            <CardTitle>Email Queue</CardTitle>
            <CardDescription>Recent outbound emails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Recipient</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Attempts</th>
                    <th className="px-4 py-3">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {emailQueue.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">No recent tasks</td></tr>
                  ) : emailQueue.map((t: any) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{t.type}</td>
                      <td className="px-4 py-3">{t.recipient}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={getStatusColor(t.status)}>{t.status}</Badge>
                      </td>
                      <td className="px-4 py-3">{t.attempts}</td>
                      <td className="px-4 py-3 text-red-500 text-xs truncate max-w-[200px]">{t.errorMessage || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Generate Queue */}
        <Card className="col-span-full shadow-md">
          <CardHeader>
            <CardTitle>Generate Queue</CardTitle>
            <CardDescription>Recent auto-sales generation tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Min/Max</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Attempts</th>
                    <th className="px-4 py-3">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {generateQueue.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">No recent tasks</td></tr>
                  ) : generateQueue.map((t: any) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono text-xs">{t.id.slice(0,8)}</td>
                      <td className="px-4 py-3">₹{t.minAmount} - ₹{t.maxAmount}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={getStatusColor(t.status)}>{t.status}</Badge>
                      </td>
                      <td className="px-4 py-3">{t.attempts}</td>
                      <td className="px-4 py-3 text-red-500 text-xs truncate max-w-[200px]">{t.errorMessage || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
