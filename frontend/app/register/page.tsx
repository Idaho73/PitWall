"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      username: String(fd.get("username") ?? ""),
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("Sikertelen regisztráció");
      setError(data?.error ?? "Sikertelen regisztráció.");
      return;
    }
    toast.success("Sikeres regisztráció");
    router.push("/login");
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md f1-panel f1-glow p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--text-0)" }}>
              Regisztráció
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-1)" }}>
              Új fiók létrehozása (username + email + jelszó).
            </p>
          </div>

          <span className="f1-badge">NEW</span>
        </div>

        {error ? <div className="mt-4 f1-error">{error}</div> : null}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-1)" }} htmlFor="username">
              Felhasználónév
            </label>
            <input id="username" name="username" className="f1-input" autoComplete="username" required />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-1)" }} htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" className="f1-input" autoComplete="email" required />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-1)" }} htmlFor="password">
              Jelszó
            </label>
            <input id="password" name="password" type="password" className="f1-input" autoComplete="new-password" required />
          </div>

          <button
            disabled={loading}
            className="f1-btn h-[42px] px-4 font-medium disabled:opacity-60"
            style={{
              borderColor: "rgba(0,229,255,0.35)",
              background: "rgba(0,229,255,0.10)",
            }}
          >
            {loading ? "Regisztráció..." : "Regisztráció"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <a
              href="/login"
              className="underline underline-offset-4"
              style={{ color: "var(--text-1)" }}
            >
              Már van fiókod? Bejelentkezés
            </a>

            <a
              href="/"
              className="underline underline-offset-4"
              style={{ color: "var(--text-2)" }}
            >
              Vissza
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
