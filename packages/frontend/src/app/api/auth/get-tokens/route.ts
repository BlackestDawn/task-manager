import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access-token")?.value || null;
  const refreshToken = cookieStore.get("refresh-token")?.value || null;

  if (!accessToken || !refreshToken) return NextResponse.json({ accessToken: null, refreshToken: null }, { status: 401 });

  return NextResponse.json({ accessToken, refreshToken }, { status: 200 });
}
