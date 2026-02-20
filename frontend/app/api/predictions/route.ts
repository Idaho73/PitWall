import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    if (!backendBase) {
      return NextResponse.json({ message: "API_BASE_URL is not set." }, { status: 500 });
    }

    const token = (await cookies()).get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    const upstream = await fetch(`${backendBase}/api/predictions`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const raw = await upstream.text();
    const ct = upstream.headers.get("content-type") ?? "";

    if (ct.includes("application/json")) {
      return NextResponse.json(raw ? JSON.parse(raw) : {}, { status: upstream.status });
    }
    return new NextResponse(raw, { status: upstream.status });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Server error" }, { status: 500 });
  }
}
