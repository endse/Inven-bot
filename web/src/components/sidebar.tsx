"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, CheckSquare, Package, FileBarChart, History, Bot, Sparkles } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/generate-sales", label: "Auto Sales", icon: Sparkles },
  { href: "/review", label: "Review", icon: CheckSquare },
  { href: "/history", label: "History", icon: History },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/reports", label: "Reports", icon: FileBarChart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex relative h-screen w-72 flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground shadow-2xl shadow-indigo-900/5">
        <div className="flex h-20 items-center gap-3 px-8 font-bold text-xl tracking-tight border-b border-sidebar-border/50 shrink-0">
          <div className="bg-primary/20 p-2 rounded-xl text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <span className="bg-gradient-to-br from-sidebar-foreground to-sidebar-foreground/60 bg-clip-text text-transparent">
            Inventory Bot
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1.5">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-sidebar-border/50 shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent/50 text-sm border border-sidebar-border/50">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
              US
            </div>
            <div className="flex flex-col truncate">
              <span className="font-medium text-sidebar-foreground truncate">Accountant</span>
              <span className="text-xs text-sidebar-foreground/60 truncate">Pro Workspace</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 px-2 flex items-center justify-around pb-safe">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center w-full h-full gap-1 pt-1"
            >
              <div className={`flex items-center justify-center p-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-500'}`}>
                <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
