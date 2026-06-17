"use client"
import { useRouter } from "next/navigation"

export default function InventoryFilter({ currentMonth }: { currentMonth: string }) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-4">
      <label className="font-medium text-slate-700">Filter Month:</label>
      <input 
        type="month" 
        className="border rounded px-3 py-1.5"
        value={currentMonth}
        onChange={(e) => {
          if (e.target.value) {
            router.push(`/inventory?month=${e.target.value}`)
          }
        }}
      />
    </div>
  )
}
