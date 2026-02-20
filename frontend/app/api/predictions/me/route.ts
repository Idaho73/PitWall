import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  try {
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    if (!backendBase) {
      return NextResponse.json(
        { message: "API_BASE_URL is not set." },
        { status: 500 }
      );
    }

    // ✅ token a cookie-ból
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { detail: "Not authenticated" },
        { status: 401 }
      );
    }

    const upstream = await fetch(
      `${backendBase}/api/predictions/me`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const raw = await upstream.text();
    const contentType = upstream.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      return NextResponse.json(
        raw ? JSON.parse(raw) : [],
        { status: upstream.status }
      );
    }

    return new NextResponse(raw, { status: upstream.status });

  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
