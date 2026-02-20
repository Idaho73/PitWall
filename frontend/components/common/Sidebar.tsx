"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

type MeResponse = {
  user: { username: string; email?: string } | null;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [user, setUser] = useState<MeResponse["user"]>(null);
  const pathname = usePathname();
  const router = useRouter();

  // minden route váltáskor frissítjük, hogy login után azonnal megjelenjen
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: MeResponse) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    onClose();
    router.push("/");
    router.refresh(); // biztos ami biztos
    toast.success("Sikeres kijelentkezés");
  }

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },

    // 🔒 csak belépve
    ...(user ? [{ name: "Predictions", href: "/predictions" }] : []),
    {name: "Lap Comparison", href: "/lapComparison" },
  ];

  return (
    <>
      {/* Overlay mobilra */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] z-50
          p-4 f1-glass
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header rész a sidebar tetején */}
        <div className="mb-3 pb-3 border-b f1-divider">
          {!user ? (
            <Link
              href="/login"
              onClick={onClose}
              className="inline-flex items-center gap-2 f1-btn px-3 py-2"
              style={{
                borderColor: "rgba(182,255,46,0.35)",
                background: "rgba(182,255,46,0.10)",
              }}
            >
              Login
            </Link>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: "var(--text-0)" }}>
                  {user.username}
                </div>
                {user.email ? (
                  <div className="text-xs truncate" style={{ color: "var(--text-2)" }}>
                    {user.email}
                  </div>
                ) : null}
              </div>

              <button
                onClick={handleLogout}
                className="f1-btn px-3 py-2 text-sm"
                style={{
                  borderColor: "rgba(255,30,30,0.35)",
                  background: "rgba(255,30,30,0.10)",
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Menü */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="p-2 rounded-lg border border-transparent hover:border-[rgba(182,255,46,0.35)] hover:bg-[rgba(182,255,46,0.06)] transition"
              onClick={onClose}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
