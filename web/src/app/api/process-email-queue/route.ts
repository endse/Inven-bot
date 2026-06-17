import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateInventoryPdf, generateBillPdf } from '@/lib/pdf';
import { sendEmailWithPdf } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const task = await prisma.emailQueue.findFirst({
      where: { 
        status: { in: ['pending', 'failed'] }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (!task) {
      return NextResponse.json({ processed: 0, message: "No pending emails" });
    }

    await prisma.emailQueue.update({
      where: { id: task.id },
      data: { status: 'processing', attempts: task.attempts + 1 }
    });

    try {
      let pdfBuffer: Buffer;
      let filename: string;
      let subject: string;
      let text: string;

      const payload = task.payload as any;

      if (task.type === 'monthly_inventory') {
        const month = payload.month;
        if (!month) throw new Error("Month is required for inventory PDF");
        
        pdfBuffer = await generateInventoryPdf(month);
        filename = `Inventory_Report_${month}.pdf`;
        subject = `Monthly Inventory Report - ${month}`;
        text = `Please find attached the inventory report for ${month}.`;
        
      } else if (task.type === 'generated_bill') {
        const draftId = payload.draftId;
        if (!draftId) throw new Error("Draft ID is required for generated bill PDF");
        
        pdfBuffer = await generateBillPdf(draftId);
        filename = `Invoice_${draftId.slice(-6)}.pdf`;
        subject = `Generated Bill - ${draftId.slice(-6)}`;
        text = `Please find attached the generated bill document.`;
        
      } else {
        throw new Error(`Unknown email task type: ${task.type}`);
      }

      await sendEmailWithPdf(task.recipient, subject, text, pdfBuffer, filename);

      await prisma.emailQueue.update({
        where: { id: task.id },
        data: { status: 'completed' }
      });

      return NextResponse.json({ processed: 1, type: task.type });
      
    } catch (err: any) {
      console.error("Email Queue Error:", err);
      const errMsg = err.message || "Failed to generate or send email";
      await prisma.emailQueue.update({
        where: { id: task.id },
        data: { status: 'failed', errorMessage: errMsg }
      });
      
      return NextResponse.json({ processed: 0, error: errMsg }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
