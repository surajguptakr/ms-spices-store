import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validations";
import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const parsed = adminLoginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  try {
    const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!admin || !(await verifyPassword(parsed.data.password, admin.passwordHash))) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    await createSession(admin.email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Admin sign-in is temporarily unavailable." }, { status: 503 });
  }
}

export async function DELETE() {
  const { clearSession } = await import("@/lib/auth");
  await clearSession();
  return NextResponse.json({ success: true });
}