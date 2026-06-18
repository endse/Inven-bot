import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  
  return (
    <div className="flex h-screen overflow-hidden bg-background/50 selection:bg-primary/20">
      <Sidebar role={session?.role} userName={session?.name || undefined} userEmail={session?.email || undefined} />
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 md:px-12 md:py-10 md:pb-10">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
