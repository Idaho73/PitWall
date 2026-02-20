"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full mt-16 f1-glass border-t border-white/5">
    <div className="max-w-7xl mx-auto px-4 py-6 flex justify-center">
        <Link
        href="https://github.com/Idaho73"
          className="text-sm font-medium opacity-90 min-w-[180px] flex justify-end hover:opacity-70 transition-opacity"
        >
        Product by Idaho73
        </Link>
    </div>
    </footer>
  );
}