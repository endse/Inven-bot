import Link from "next/link";
import { LayoutDashboard, Upload, CheckSquare, Package, FileBarChart, Settings, History } from "lucide-react";

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-slate-950 text-slate-50">
      <div className="flex h-14 items-center px-4 font-bold text-lg border-b border-slate-800">
        Inventory Bot
      </div>
      <nav className="flex-1 space-y-1 p-2">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">
          <LayoutDashboard className="h-5 w-5" /> Dashboard
        </Link>
        <Link href="/upload" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">
          <Upload className="h-5 w-5" /> Upload Invoice
        </Link>
        <Link href="/review" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">
          <CheckSquare className="h-5 w-5" /> Review Queue
        </Link>
        <Link href="/history" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">
          <History className="h-5 w-5" /> Invoice History
        </Link>
        <Link href="/inventory" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">
          <Package className="h-5 w-5" /> Inventory
        </Link>
        <Link href="/reports" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">
          <FileBarChart className="h-5 w-5" /> Reports
        </Link>
      </nav>
    </div>
  )
}
