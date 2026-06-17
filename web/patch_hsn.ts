import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import ExcelJS from 'exceljs';
import path from 'path';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function patchHsn() {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(process.cwd(), '../GST 2026.xlsx');
  await workbook.xlsx.readFile(filePath);
  
  const worksheet = workbook.worksheets[0];
  
  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    const values = row.values as any[];
    
    // Index 1 is Col A (S.no), Index 2 is Col B (Name), Index 3 is Col C (HSN)
    const nameCell = values[2];
    const hsnCell = values[3];
    
    if (!nameCell) continue;
    
    const name = nameCell.toString().trim();
    const hsn = hsnCell ? hsnCell.toString().trim() : null;
    
    if (hsn) {
      // Find product and update HSN
      await prisma.product.updateMany({
        where: { name: name },
        data: { hsn: hsn }
      });
      console.log(`Updated ${name} with HSN: ${hsn}`);
    }
  }
  
  console.log("HSN Patch completed.");
  process.exit(0);
}

patchHsn().catch(console.error);
