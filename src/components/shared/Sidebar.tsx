"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Home, Bot, Wallet, Activity, Calculator, Settings, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { getMenuItems, SETTINGS_ITEM, type UserRole } from "@/lib/auth-utils";

// Map icon names to components
const iconMap = {
  Home,
  Bot,
  Wallet,
  Activity,
  Calculator,
  Settings,
  Users,
};

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const { data: session } = useSession();
  const userRole = (session?.user?.role || "user") as UserRole;
  
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Obtener items del menú según el rol
  const menuItems = getMenuItems(userRole);

  const NavLinks = () => (
    <nav className="flex flex-col gap-3 text-[12px]">
      {menuItems.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        // Para HOME, verificar coincidencia exacta. Para otros, verificar prefijo
        const isItemActive = item.href === "/dashboard" 
          ? pathname === "/dashboard"
          : isActive(item.href);
        
        return (
          <Link
            key={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
              isItemActive ? "bg-[#60a5fa] text-white" : "text-white/80 hover:text-white hover:bg-[#60a5fa]"
            }`}
            href={item.href}
            onClick={() => setMobileOpen(false)}
          >
            {Icon && <Icon size={18} className="opacity-80" />}
            {item.label}
          </Link>
        );
      })}

      <div className="h-px my-3 bg-[var(--border)]" />

      <Link
        className={`mt-1 inline-flex items-center gap-3 px-4 py-2 rounded-xl text-[12px] font-medium transition-colors ${
          isActive(SETTINGS_ITEM.href) ? "bg-[#60a5fa] text-white" : "text-white/80 hover:text-white hover:bg-[#60a5fa]"
        }`}
        href={SETTINGS_ITEM.href}
        onClick={() => setMobileOpen(false)}
      >
        <Settings size={16} />
        {SETTINGS_ITEM.label}
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
