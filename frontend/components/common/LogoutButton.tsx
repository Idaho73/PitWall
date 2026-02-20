"use client";

export function LogoutButton() {
  return (
    <button
      className="rounded-xl border px-3 py-2 text-sm"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
    >
      Kijelentkezés
    </button>
  );
}
