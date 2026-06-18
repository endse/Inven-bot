export function getMonthlyInventoryEmailHtml(month: string) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
      .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
      .content { padding: 40px 32px; color: #334155; line-height: 1.6; }
      .content p { margin: 0 0 16px; }
      .footer { background: #f1f5f9; padding: 24px; text-align: center; color: #64748b; font-size: 14px; }
      .btn { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Monthly Inventory Report</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>Your comprehensive inventory and balance sheet report for <strong>${month}</strong> has been generated successfully.</p>
        <p>Please find the PDF document attached to this email. It contains a detailed breakdown of all your purchases, sales, and ending inventory stock values for the period.</p>
        <p>If you have any questions, please reply to this email.</p>
        <div style="text-align: center;">
          <a href="https://inven-bot.vercel.app/reports" class="view-btn">View Online Dashboard</a>
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Inventory Bot Automation. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}

export function getGeneratedBillEmailHtml(draftId: string) {
  const shortId = draftId.slice(0, 8);
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
      .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
      .content { padding: 40px 32px; color: #334155; line-height: 1.6; }
      .content p { margin: 0 0 16px; }
      .invoice-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center; font-family: monospace; font-size: 18px; font-weight: bold; color: #0f172a; }
      .footer { background: #f1f5f9; padding: 24px; text-align: center; color: #64748b; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Your Bill is Ready</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>A new bill has been automatically generated based on your recent transactions.</p>
        <div class="invoice-box">
          Invoice ID: #${shortId.toUpperCase()}
        </div>
        <p>Please find the official PDF document attached to this email for your records.</p>
        <p>Thank you for using our automated sales system.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Inventory Bot Automation. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}
