import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";

const settingKeys = ["announcement", "shippingFee", "freeShippingThreshold", "codEnabled", "contactEmail", "contactPhone", "address", "shippingPolicy", "returnsPolicy", "privacyPolicy", "termsPolicy"];
const settingsSchema = z.record(z.string().max(4000)).refine((settings) => Object.keys(settings).every((key) => settingKeys.includes(key)), "Unknown setting key.");

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });
    return NextResponse.json({ settings: Object.fromEntries(settings.map(({ key, value }) => [key, value])) });
  } catch {
    return NextResponse.json({ error: "Could not load settings." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid settings." }, { status: 400 });
  const { shippingFee, freeShippingThreshold } = parsed.data;
  if ((shippingFee !== undefined && !/^\d{1,5}$/.test(shippingFee)) || (freeShippingThreshold !== undefined && !/^\d{1,6}$/.test(freeShippingThreshold))) return NextResponse.json({ error: "Shipping values must be whole rupee amounts." }, { status: 400 });
  try {
    await prisma.$transaction(Object.entries(parsed.data).map(([key, value]) => prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not save settings." }, { status: 503 });
  }
}