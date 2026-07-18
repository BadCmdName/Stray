import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { stopDaemon } from "@/lib/daemon";

export async function POST() {
  const session = await getSession();
  if (session) {
    stopDaemon(session.userId);
  }
  const cookieStore = await cookies();
  cookieStore.delete("stray_session");
  return NextResponse.json({ success: true });
}
