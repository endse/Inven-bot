"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { queueMonthlyInventoryEmail } from "../email-actions"
import { toast } from "sonner"

export default function ReportsPage() {
  const [month, setMonth] = useState("2026-01")
  const [email, setEmail] = useState("")
  const [isQueueing, setIsQueueing] = useState(false)

  const handleGenerate = () => {
    window.open(`/api/reports?month=${month}`, "_blank");
  }

  const handleEmail = async () => {
    try {
      setIsQueueing(true);
      await queueMonthlyInventoryEmail(month, email || undefined);
      toast.success("Inventory Report queued for emailing!");
      setEmail("");
    } catch (e: any) {
      toast.error(e.message || "Failed to queue email");
    } finally {
      setIsQueueing(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Generate Monthly Inventory Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 max-w-sm">
            <Input type="month" value={month} onChange={e => setMonth(e.target.value)} />
            <Button className="w-full" onClick={handleGenerate}>Download Excel Report</Button>
          </div>
          <div className="border-t pt-6 space-y-4 max-w-sm">
            <h3 className="font-semibold text-sm">Email PDF Report</h3>
            <Input 
              type="email" 
              placeholder="Optional: Additional recipient email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={handleEmail}
              disabled={isQueueing}
            >
              {isQueueing ? "Queueing..." : "Queue Email PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
