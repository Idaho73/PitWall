import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "";

if (!API_BASE) {
  throw new Error("Missing API_BASE_URL in .env.local");
}

function parseFastApi422(detail: any): string {
  // FastAPI 422 detail: [{ loc: [...], msg, type, ... }]
  if (!Array.isArray(detail)) return "Hibás adatok.";
  const msgs = detail
    .map((d) => (typeof d?.msg === "string" ? d.msg : null))
    .filter(Boolean) as string[];
  return msgs.length ? msgs.join(" • ") : "Hibás adatok.";
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";

  let payload: { username: string; email: string; password: string };

  // engedjük a JSON-t és a formot is a frontend felől (rugalmas)
  if (contentType.includes("application/json")) {
    const body = await req.json();
    payload = {
      username: String(body?.username ?? ""),
      email: String(body?.email ?? ""),
      password: String(body?.password ?? ""),
    };
  } else if (contentType.includes("form")) {
    const form = await req.formData();
    payload = {
      username: String(form.get("username") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
  } else {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  if (!payload.username || !payload.email || !payload.password) {
    return NextResponse.json({ error: "Minden mező kitöltése kötelező." }, { status: 400 });
  }

  const res = await fetch(`${API_BASE}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = "Sikertelen regisztráció.";
    try {
      const data = await res.json();
      if (res.status === 422 && data?.detail) msg = parseFastApi422(data.detail);
      if (typeof data?.detail === "string") msg = data.detail;
      if (typeof data?.message === "string") msg = data.message;
    } catch {}
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  const data = await res.json(); // { id, username, email }
  return NextResponse.json({ ok: true, user: data });
}
