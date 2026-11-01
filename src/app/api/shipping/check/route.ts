import { NextResponse } from "next/server";
import { z } from "zod";
import { lookupDeliveryPin } from "@/lib/shipping";

const schema = z.object({ pinCode: z.string().regex(/^[1-9]\d{5}$/) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid 6-digit PIN code." }, { status: 400 });
  try {
    const location = await lookupDeliveryPin(parsed.data.pinCode);
    if (!location) return NextResponse.json({ error: "Cash on delivery is not available for this PIN code." }, { status: 422 });
    return NextResponse.json({ serviceable: true, location });
  } catch {
    return NextResponse.json({ error: "PIN code lookup is temporarily unavailable. Please try again." }, { status: 503 });
  }
}