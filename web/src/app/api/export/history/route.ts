import { NextResponse } from "next/server";
import { ExportService } from "@/services/ExportService";

export async function GET(req: Request) {
  try {
    const csvContent = await ExportService.getHistoryCSV();

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="history-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error("Export error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
