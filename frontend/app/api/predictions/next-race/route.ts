import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: "Missing BACKEND_BASE_URL" }, { status: 500 });
  }

  const res = await fetch(`${baseUrl}/api/predictions/next-race`, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: `Backend error: ${res.status}` }, { status: res.status });
  }

  const data: string = await res.json();
  return NextResponse.json(data);
}
