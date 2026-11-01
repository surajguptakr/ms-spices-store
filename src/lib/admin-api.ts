import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getAdminSession();
  return session ? null : NextResponse.json({ error: "Authentication required." }, { status: 401 });
}