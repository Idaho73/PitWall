"use client";

import Image from "next/image";
import Link from "next/link";

type HeaderProps = {
  onMenuClick: () => void;
  profileName?: string;
};

export default function Header({
  onMenuClick,
  profileName = "\"First you have to finish\" ~ Michael Schumacher",
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full h-16 z-50 f1-glass">
      <div className="h-full flex items-center justify-between px-4 gap-3">
        
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <button
            className="md:hidden px-3 py-2 f1-btn"
            onClick={onMenuClick}
            aria-label="Menu"
          >
            ☰
          </button>

          {/* Logo + Title clickable */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/F1-Logo.png"
              alt="Logo"
              width={40}
              height={35}
            />
            <span className="font-semibold tracking-wide cursor-pointer">
              MyApp
            </span>
          </Link>
        </div>

        {/* Right: Quote clickable */}
        <Link
          href="/"
          className="text-sm font-medium opacity-90 min-w-[180px] flex justify-end hover:opacity-70 transition-opacity"
        >
          {profileName}
        </Link>
      </div>
    </header>
  );
}