import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GeneratedSaleItem {
  productId: string;
  product_name: string;
  hsn?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface GeneratedSale {
  items: GeneratedSaleItem[];
  totalAmount: number;
}

export async function generateSmartSale(
  products: { id: string; name: string; rate: number; hsn?: string | null }[],
  minAmount: number,
  maxAmount: number
): Promise<GeneratedSale> {
  const prompt = `You are a smart sales generator for an inventory system.
I will provide you with a list of available products, their rates, and their HSN codes.
Your task is to select a subset of 3 to 7 products that are LOGICALLY RELEVANT or commonly bought together (e.g. group all office supplies, or group all electronics).
Then, assign realistic integer quantities to these products such that the TOTAL bill amount falls EXACTLY between ${minAmount} and ${maxAmount}.

Available Products (JSON format: [{id, name, rate, hsn}]):
${JSON.stringify(products, null, 2)}

Return ONLY a valid JSON object matching this structure exactly:
{
  "items": [
    {
      "productId": "string",
      "product_name": "string",
      "hsn": "string or null",
      "quantity": 0,
      "rate": 0,
      "amount": 0 // must equal quantity * rate
    }
  ],
  "totalAmount": 0 // sum of all amounts
}

Do not include markdown backticks. Return raw JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate sales data from AI");
  }

  try {
    const data = JSON.parse(response.text) as GeneratedSale;
    
    // Safety check - recalculate total to prevent AI math errors
    let safeTotal = 0;
    data.items = data.items.map(item => {
      const safeAmount = Number(item.quantity) * Number(item.rate);
      safeTotal += safeAmount;
      return { ...item, amount: safeAmount };
    });
    data.totalAmount = safeTotal;
    
    return data;
  } catch (e) {
    throw new Error("Invalid JSON response from AI");
  }
}
