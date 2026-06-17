import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const draft = await prisma.invoiceDraft.findUnique({
    where: { id },
    select: { imageUrl: true }
  });

  if (!draft || !draft.imageUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  // imageUrl format: data:image/jpeg;base64,/9j/4AAQSkZ...
  const match = draft.imageUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  
  if (!match) {
    return new NextResponse("Invalid image format", { status: 500 });
  }

  const mimeType = match[1];
  const base64Data = match[2];
  
  const buffer = Buffer.from(base64Data, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
