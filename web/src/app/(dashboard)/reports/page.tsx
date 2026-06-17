"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ReportsPage() {
  const [month, setMonth] = useState("2026-01")

  const handleGenerate = () => {
    window.open(`/api/reports?month=${month}`, "_blank");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Generate Monthly GST Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="month" value={month} onChange={e => setMonth(e.target.value)} />
          <Button onClick={handleGenerate}>Generate Report</Button>
        </CardContent>
      </Card>
    </div>
  )
}
