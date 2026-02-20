import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: "Missing BACKEND_BASE_URL" }, { status: 500 });
  }

  const yearNum = Number(year);
  if (!Number.isFinite(yearNum)) {
    return NextResponse.json({ error: "Invalid year", received: year }, { status: 400 });
  }

  const res = await fetch(`${baseUrl}/api/leaderboard/${yearNum}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Backend error: ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
