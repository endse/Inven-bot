import GenerateClient from "./GenerateClient";
import { prisma } from "@/lib/prisma";

export default async function GenerateSalesPage() {
  const pendingDrafts = await prisma.invoiceDraft.findMany({
    where: {
      imageUrl: "SYSTEM_GENERATED",
      status: "pending_review"
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Auto Sales Generator</h1>
          <p className="text-slate-500 mt-1">Leverage AI to create realistic, bundled sales invoices to populate your inventory transactions.</p>
        </div>
      </div>
      
      <GenerateClient initialDrafts={pendingDrafts} />
    </div>
  );
}
