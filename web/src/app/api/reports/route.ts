import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  
  if (!month) return NextResponse.json({ error: "Month required" }, { status: 400 });

  const [year, m] = month.split("-");
  
  const transactions = await prisma.transaction.findMany({
    where: {
      transactionDate: {
        gte: new Date(Number(year), Number(m) - 1, 1),
        lt: new Date(Number(year), Number(m), 1),
      }
    },
    include: { product: true }
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`GST_${month.replace('-', '_')}`);

  worksheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Type", key: "type", width: 15 },
    { header: "Product", key: "product", width: 30 },
    { header: "Quantity", key: "qty", width: 15 },
    { header: "Rate", key: "rate", width: 15 },
    { header: "Amount", key: "amount", width: 20 },
  ];

  transactions.forEach(tx => {
    worksheet.addRow({
      date: tx.transactionDate.toISOString().split("T")[0],
      type: tx.transactionType,
      product: tx.product.name,
      qty: Number(tx.quantity),
      rate: Number(tx.rate || 0),
      amount: Number(tx.amount || 0)
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="GST_${month.replace('-', '_')}.xlsx"`
    }
  });
}
