import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export async function GET() {
  if (!API_BASE) {
    return NextResponse.json({ error: "Missing API_BASE_URL" }, { status: 500 });
  }

  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const res = await fetch(`${API_BASE}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ user: null });
  }

  const user = await res.json();

  return NextResponse.json({ user });
}
