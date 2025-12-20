"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Home, Bot, Wallet, Activity, Calculator, Settings, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const NavLinks = () => (
    <nav className="flex flex-col gap-3 text-[12px]">
      <Link
        className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
          pathname === "/dashboard" ? "bg-[#60a5fa] text-white" : "text-white/80 hover:text-white hover:bg-[#60a5fa]"
        }`}
        href="/dashboard"
        onClick={() => setMobileOpen(false)}
      >
        <Home size={18} className="opacity-80" />
        HOME
      </Link>

      <Link
        className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
          isActive("/dashboard/bots") ? "bg-[#60a5fa] text-white" : "text-white/80 hover:text-white hover:bg-[#60a5fa]"
        }`}
        href="/dashboard/bots"
        onClick={() => setMobileOpen(false)}
      >
        <Bot size={18} className="opacity-80" />
        BOTS
      </Link>

      <Link
        className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
          isActive("/dashboard/wallets") ? "bg-[#60a5fa] text-white" : "text-white/80 hover:text-white hover:bg-[#60a5fa]"
        }`}
        href="/dashboard/wallets"
        onClick={() => setMobileOpen(false)}
      >
        <Wallet size={18} className="opacity-80" />
        WALLETS
      </Link>

      <Link
        className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
          isActive("/dashboard/operaciones") ? "bg-[#60a5fa] text-white" : "text-white/80 hover:text-white hover:bg-[#60a5fa]"
        }`}
        href="/dashboard/operaciones"
        onClick={() => setMobileOpen(false)}
      >
        <Activity size={18} className="opacity-80" />
        OPERACIONES
      </Link>

      <Link
        className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
          isActive("/dashboard/convert") ? "bg-[#60a5fa] text-white" : "text-white/80 hover:text-white hover:bg-[#60a5fa]"
        }`}
        href="/dashboard/convert"
        onClick={() => setMobileOpen(false)}
      >
        <Calculator size={18} className="opacity-80" />
        CONVERSOR
      </Link>

      <div className="h-px my-3 bg-[var(--border)]" />

      <Link
        className={`mt-1 inline-flex items-center gap-3 px-4 py-2 rounded-xl text-[12px] font-medium transition-colors ${
          isActive("/dashboard/configuracion") ? "bg-[#60a5fa] text-white" : "text-white/80 hover:text-white hover:bg-[#60a5fa]"
        }`}
        href="/dashboard/configuracion"
        onClick={() => setMobileOpen(false)}
      >
        <Settings size={16} />
        CONFIGURACION
      </Link>
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        aria-label="Abrir menú"
        className="md:hidden fixed top-4 left-4 z-50 rounded-md p-2 bg-black text-white/90"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} />
      </button>

      {/* Desktop sidebar (fixed) */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-secondary text-white p-6 overflow-hidden">
        <div className="mb-8 flex flex-col items-center w-full">
          <Image src="/logo.svg" alt="ITTrade" width={120} height={36} className="mb-4" />
          <div className="h-px w-full bg-[var(--border)]" />
        </div>
        <NavLinks />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-secondary text-white p-6 z-50 overflow-hidden">
            <div className="mb-8 flex flex-col items-center w-full">
              <Image src="/logo.svg" alt="ITTrade" width={120} height={36} className="mb-4" />
              <div className="h-px w-full bg-[var(--border)]" />
            </div>
            <NavLinks />
          </aside>
        </>
      )}
    </>
  );
}
