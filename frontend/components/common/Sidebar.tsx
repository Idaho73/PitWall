"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { clearToken, getToken } from "@/lib/auth";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

type UserOut = {
  id: number;
  username: string;
  email: string;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  async function loadMe() {
    const token = getToken();
    if (!token) {
      setUser(null);
      setAuthChecked(true);
      return;
    }

    try {
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!res.ok) {
        // token invalid/expired -> takarítsuk
        clearToken();
        setUser(null);
        setAuthChecked(true);
        return;
      }

      const data = (await res.json()) as UserOut;
      setUser(data);
      setAuthChecked(true);
    } catch {
      // hálózati hiba esetén ne törölj tokent, csak ne mutass usert
      setUser(null);
      setAuthChecked(true);
    }
  }

  // route váltáskor frissítés (ahogy nálad volt)
  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // login/logout eventre is frissítsünk azonnal
  useEffect(() => {
    const onAuthChanged = () => loadMe();
    window.addEventListener("auth-changed", onAuthChanged);
    window.addEventListener("storage", onAuthChanged);
    return () => {
      window.removeEventListener("auth-changed", onAuthChanged);
      window.removeEventListener("storage", onAuthChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    clearToken();         // nincs backend logout endpoint
    setUser(null);
    onClose();
    router.push("/");
    router.refresh();
    toast.success("Sikeres kijelentkezés");
  }

  const menuItems = useMemo(() => {
    return [
      { name: "Home", href: "/" },
      { name: "About", href: "/about" },

      ...(user ? [{ name: "Predictions", href: "/predictions" }] : []),

      { name: "Lap Comparison", href: "/lapComparison" },
      { name: "Drivers", href: "/drivers" },
    ];
  }, [user]);

  return (
    <>
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
                <div className="text-xs truncate" style={{ color: "var(--text-2)" }}>
                  {user.email}
                </div>
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

          {/* opcionális: ha zavar a “villanás”, amíg nem ellenőriztük */}
          {!authChecked ? (
            <div className="mt-2 text-xs" style={{ color: "var(--text-2)" }}>
              Ellenőrzés...
            </div>
          ) : null}
        </div>

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