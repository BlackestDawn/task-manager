import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, refreshToken } = body;

    if (!accessToken || !refreshToken) return NextResponse.json({ error: "Missing tokens" }, { status: 400 });

    const cookieStore = await cookies();

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.PLATFORM === "prod" || process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600,
      path: "/",
    });
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.PLATFORM === "prod" || process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600 * 24 * 60,
      path: "/",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating cookies:", error);
    return NextResponse.json({ error: "Failed to update cookies" }, { status: 500 });
  }
}
