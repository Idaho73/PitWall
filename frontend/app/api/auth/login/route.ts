import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  if (!backendBase) {
    return NextResponse.json({ error: "API_BASE_URL is not set." }, { status: 500 });
  }

  const fd = await req.formData();
  const username = String(fd.get("username") ?? "");
  const password = String(fd.get("password") ?? "");

  if (!username || !password) {
    return NextResponse.json({ error: "Missing username/password" }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.set("username", username);
  params.set("password", password);

  // OAuth2PasswordRequestForm mezők (nem árt, ha ott vannak)
  params.set("grant_type", "");
  params.set("scope", "");
  params.set("client_id", "");
  params.set("client_secret", "");

  const upstream = await fetch(`${backendBase}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body: params.toString(),
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const token = String(data?.access_token ?? "");
  if (!token) {
    return NextResponse.json({ error: "No access_token returned by backend." }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });

  // ✅ itt tároljuk a JWT-t
  res.cookies.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res;
}
