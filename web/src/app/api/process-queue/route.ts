import { NextResponse } from "next/server";
import { processQueueAction } from "@/app/(dashboard)/generate-sales/actions";

export async function GET() {
  try {
    const result = await processQueueAction();
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
