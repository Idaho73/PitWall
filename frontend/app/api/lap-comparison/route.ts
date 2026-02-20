import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // dev-ben is biztosan frissít
export const revalidate = 0;

function pickQuery(url: URL, key: string) {
  const v = url.searchParams.get(key);
  return v?.trim() ? v.trim() : null;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // Várt query paramok (a backend dokumentáció alapján)
  const season = pickQuery(url, "season");
  const grand_prix = pickQuery(url, "grand_prix");
  const session_code = pickQuery(url, "session_code");
  const driver1 = pickQuery(url, "driver1");
  const driver2 = pickQuery(url, "driver2");

  const missing = [
    !season && "season",
    !grand_prix && "grand_prix",
    !session_code && "session_code",
    !driver1 && "driver1",
    !driver2 && "driver2",
  ].filter(Boolean) as string[];

  if (missing.length) {
    return NextResponse.json(
      { error: `Missing query param(s): ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  // Backend base URL env-ből (ajánlott)
  const backendBase =
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
    "http://localhost:8000";

  const backendUrl = new URL("/api/lap-comparison", backendBase);
  backendUrl.searchParams.set("season", season!);
  backendUrl.searchParams.set("grand_prix", grand_prix!);
  backendUrl.searchParams.set("session_code", session_code!);
  backendUrl.searchParams.set("driver1", driver1!);
  backendUrl.searchParams.set("driver2", driver2!);

  // Auth header átpasszolása (ha van)
  const auth = req.headers.get("authorization");

  const res = await fetch(backendUrl.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
      ...(auth ? { authorization: auth } : {}),
    },
    cache: "no-store",
  });

  // Ha a backend hibát ad, azt is adjuk vissza normálisan
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const body = isJson ? await res.json() : await res.text();

  return NextResponse.json(body, { status: res.status });
}
