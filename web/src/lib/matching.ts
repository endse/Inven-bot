import Fuse from "fuse.js";
import { prisma } from "./prisma";

export async function matchProduct(productName: string) {
  const products = await prisma.product.findMany({ select: { id: true, name: true } });
  
  const fuse = new Fuse(products, {
    keys: ["name"],
    includeScore: true,
    threshold: 0.5 
  });

  const results = fuse.search(productName);
  
  if (results.length > 0) {
    const bestMatch = results[0];
    const similarityScore = (1 - (bestMatch.score || 0)) * 100;
    
    return {
      suggestedProductId: bestMatch.item.id,
      suggestedProductName: bestMatch.item.name,
      similarityScore
    };
  }
  
  return null;
}
