import PDFDocument from 'pdfkit';
import { prisma } from './prisma';

export async function generateInventoryPdf(month: string): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const [year, m] = month.split("-");
      const targetMonthStart = new Date(Number(year), Number(m) - 1, 1);
      const targetMonthEnd = new Date(Number(year), Number(m), 1);

      const products = await prisma.product.findMany({
        include: { transactions: true },
        orderBy: { name: 'asc' }
      });

      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text(`Monthly Inventory Report - ${month}`, { align: 'center' });
      doc.moveDown(2);

      // Table Header
      const startX = 50;
      let y = doc.y;
      
      const drawRow = (yPos: number, cols: string[], isHeader = false) => {
        doc.fontSize(isHeader ? 10 : 9)
           .font(isHeader ? 'Helvetica-Bold' : 'Helvetica');
        
        doc.text(cols[0], startX, yPos, { width: 140 });      // Name
        doc.text(cols[1], startX + 140, yPos, { width: 60 });  // HSN
        doc.text(cols[2], startX + 200, yPos, { width: 60 });  // Open
        doc.text(cols[3], startX + 260, yPos, { width: 60 });  // Pur
        doc.text(cols[4], startX + 320, yPos, { width: 60 });  // Sale
        doc.text(cols[5], startX + 380, yPos, { width: 60 });  // Stock
      };

      drawRow(y, ['Product Name', 'HSN', 'Opening', 'Purchases', 'Sales', 'Closing'], true);
      y += 20;
      doc.moveTo(startX, y - 5).lineTo(startX + 450, y - 5).stroke();

      products.forEach((p) => {
        let openingBalance = 0;
        let purchases = 0;
        let sales = 0;

        p.transactions.forEach((tx) => {
          const qty = Number(tx.quantity);
          if (tx.transactionDate < targetMonthStart) {
            if (tx.transactionType === "purchase") openingBalance += qty;
            if (tx.transactionType === "sale") openingBalance -= qty;
          } else if (tx.transactionDate >= targetMonthStart && tx.transactionDate < targetMonthEnd) {
            if (tx.transactionType === "purchase") purchases += qty;
            if (tx.transactionType === "sale") sales += qty;
          }
        });

        const stock = openingBalance + purchases - sales;

        if (openingBalance > 0 || purchases > 0 || sales > 0 || stock > 0) {
          if (y > 700) {
            doc.addPage();
            y = 50;
          }
          drawRow(y, [
            p.name.substring(0, 30),
            p.hsn || "-",
            openingBalance.toString(),
            purchases.toString(),
            sales.toString(),
            stock.toString()
          ]);
          y += 15;
        }
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateBillPdf(draftId: string): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const draft = await prisma.invoiceDraft.findUnique({
        where: { id: draftId }
      });

      if (!draft || !draft.extractedData) {
        throw new Error("Draft not found or missing data");
      }

      const data = draft.extractedData as any;

      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(24).text('INVOICE', { align: 'right' });
      doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.text(`Transaction Type: ${draft.transactionType.toUpperCase()}`, { align: 'right' });
      doc.moveDown(4);

      // Table Header
      const startX = 50;
      let y = doc.y;
      
      const drawRow = (yPos: number, cols: string[], isHeader = false) => {
        doc.fontSize(isHeader ? 11 : 10)
           .font(isHeader ? 'Helvetica-Bold' : 'Helvetica');
        
        doc.text(cols[0], startX, yPos, { width: 200 });       // Name
        doc.text(cols[1], startX + 200, yPos, { width: 70 });  // HSN
        doc.text(cols[2], startX + 270, yPos, { width: 50 });  // Qty
        doc.text(cols[3], startX + 320, yPos, { width: 80, align: 'right' });  // Rate
        doc.text(cols[4], startX + 400, yPos, { width: 80, align: 'right' });  // Amount
      };

      drawRow(y, ['Product Description', 'HSN Code', 'Qty', 'Rate (INR)', 'Amount (INR)'], true);
      y += 20;
      doc.moveTo(startX, y - 5).lineTo(startX + 480, y - 5).stroke();

      const items = data.items || [];
      items.forEach((item: any) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        drawRow(y, [
          item.product_name || "-",
          item.hsn || "-",
          item.quantity?.toString() || "0",
          item.rate ? Number(item.rate).toFixed(2) : "0.00",
          item.amount ? Number(item.amount).toFixed(2) : "0.00"
        ]);
        y += 20;
      });

      doc.moveTo(startX, y).lineTo(startX + 480, y).stroke();
      y += 15;

      doc.font('Helvetica-Bold').fontSize(12);
      doc.text('Total Amount:', startX + 300, y, { width: 100, align: 'right' });
      doc.text(`Rs ${Number(data.totalAmount || 0).toFixed(2)}`, startX + 400, y, { width: 80, align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
