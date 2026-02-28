import createClient from "openapi-fetch";
import type { paths } from "./schema";

function getBaseUrl() {
  return "";
}

function getAccessToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;
}

function toFormUrlEncoded(obj: Record<string, unknown>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    sp.set(k, String(v));
  }
  return sp.toString();
}

export const api = createClient<paths>({
  baseUrl: getBaseUrl(),
  fetch: async (request: Request) => {
    // auth header (mindenhol, ahol van token)
    const token = getAccessToken();
    if (token) request.headers.set("Authorization", `Bearer ${token}`);

    // 💡 csak a login endpointnál: JSON objektum -> x-www-form-urlencoded
    // (mert az OpenAPI így írja le) :contentReference[oaicite:1]{index=1}
    const url = new URL(request.url);
    if (url.pathname.endsWith("/api/users/login") && request.method === "POST") {
      const contentType = request.headers.get("content-type") ?? "";

      // ha openapi-fetch JSON-t rakna rá, vagy üres, akkor átírjuk
      if (contentType.includes("application/json") || contentType === "") {
        const raw = await request.clone().json().catch(() => null);

        if (raw && typeof raw === "object") {
          const body = toFormUrlEncoded(raw as Record<string, unknown>);
          const headers = new Headers(request.headers);
          headers.set("content-type", "application/x-www-form-urlencoded");

          request = new Request(request.url, {
            method: request.method,
            headers,
            body,
            // keep other flags
            credentials: request.credentials,
            cache: request.cache,
            redirect: request.redirect,
            referrer: request.referrer,
            referrerPolicy: request.referrerPolicy,
            integrity: request.integrity,
            keepalive: (request as any).keepalive,
            mode: request.mode,
            signal: request.signal,
          });
        }
      }
    }

    return fetch(request);
  },
});