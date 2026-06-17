const ExcelJS = require('exceljs');

async function readExcel() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('../GST 2026.xlsx');
  
  const worksheet = workbook.worksheets[0]; // first sheet
  
  const headers = worksheet.getRow(1).values;
  const firstRow = worksheet.getRow(2).values;
  
  console.log("Headers:", headers);
  console.log("First Row:", firstRow);
}

readExcel().catch(console.error);
