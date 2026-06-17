import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import ExcelJS from 'exceljs';
import path from 'path';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function parseNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  const str = val.toString().replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

async function importExcel() {
  console.log("Wiping existing data to perfectly remap...");
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.invoiceDraft.deleteMany();

  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(process.cwd(), '../GST 2026.xlsx');
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.worksheets[0];

  // Start from row 2 to skip headers
  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    const nameCell = row.getCell(2).value;
    const hsnCell = row.getCell(3).value;
    const rateCell = row.getCell(4).value;
    const openingBalCell = row.getCell(5).value;
    const purchaseCell = row.getCell(6).value;
    const salesCell = row.getCell(7).value;

    if (!nameCell) continue;

    const name = nameCell.toString().trim();
    const hsn = hsnCell ? hsnCell.toString().trim() : null;
    const rate = parseNumber(rateCell);
    
    // UPSERT Product
    const product = await prisma.product.upsert({
      where: { name },
      update: { hsn, lastRate: rate },
      create: { name, hsn, lastRate: rate }
    });

    const openingBal = parseNumber(openingBalCell);
    const purchase = parseNumber(purchaseCell);
    const sales = parseNumber(salesCell);

    if (openingBal > 0) {
      await prisma.transaction.create({
        data: {
          productId: product.id,
          transactionType: 'purchase',
          transactionDate: new Date('2025-12-31'),
          dateSource: 'current',
          quantity: openingBal,
          rate: rate
        }
      });
    }

    if (purchase > 0) {
      await prisma.transaction.create({
        data: {
          productId: product.id,
          transactionType: 'purchase',
          transactionDate: new Date('2026-01-15'),
          dateSource: 'current',
          quantity: purchase,
          rate: rate
        }
      });
    }

    if (sales > 0) {
      await prisma.transaction.create({
        data: {
          productId: product.id,
          transactionType: 'sale',
          transactionDate: new Date('2026-01-31'),
          dateSource: 'current',
          quantity: sales,
          rate: rate
        }
      });
    }

    console.log(`Imported Product: ${name} (HSN: ${hsn}, Rate: ${rate})`);
  }

  console.log("Import completed successfully!");
  process.exit(0);
}

importExcel()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
