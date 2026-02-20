"use client";

import "./globals.css";
import { useState } from "react";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import { Toaster } from "sonner";
import Footer from "@/components/common/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="hu">
      <body>
        <Header
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />

        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen((prev) => !prev)}
        />

      <main className="pt-16 md:ml-64 p-4">
        <div className="f1-panel p-4">
          {children}
          <Toaster
          theme="dark"
          position="top-center"
          richColors
        />
        </div>
      </main>
      <Footer />
      </body>
    </html>
  );
}