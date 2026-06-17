import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPT = `You are an invoice parsing engine.
Extract inventory line items only.

Ignore:
GST
Tax totals
Addresses
Phone numbers
Bank details
Invoice summaries

Return JSON:
{
  "invoice_date":"",
  "items":[
    {
      "product_name":"",
      "quantity":0,
      "rate":0,
      "amount":0
    }
  ]
}

If uncertain, preserve original product name exactly.
Do not invent values.
Return valid JSON only.`;

export interface ExtractedItem {
  product_name: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface ExtractedInvoice {
  invoice_date: string;
  items: ExtractedItem[];
}

export async function extractInvoiceItems(base64Image: string, mimeType: string): Promise<ExtractedInvoice> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: PROMPT },
          { inlineData: { data: base64Image, mimeType } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
    }
  });

  if (!response.text) {
    throw new Error("Failed to extract data from image");
  }

  try {
    return JSON.parse(response.text) as ExtractedInvoice;
  } catch (e) {
    throw new Error("Invalid JSON response from AI");
  }
}
