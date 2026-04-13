"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  Mail,
  Home,
  ChartNoAxesCombined,
  Wallet,
  Activity,
  Calculator,
  Settings,
  Settings2,
  Users,
  Columns,
  Copy,
  Layout,
  ChevronDown,
  ChevronUp,
  LucideIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
  getMenuItems,
  SETTINGS_ITEM,
  type UserRole,
  type NavItem,
} from "@/lib/auth-utils";

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  Home,
  ChartNoAxesCombined,
  Wallet,
  Activity,
  Calculator,
  Settings,
  Settings2,
  Users,
  Mail,
  Copy,
  Layout,
  ChevronDown,
  ChevronUp,
  Columns,
};

interface NavLinksProps {
  menuItems: NavItem[];
  pathname: string;
  isActive: (href: string) => boolean;
  onItemClick: () => void;
  role: string;
}

const NavLinks = ({
  menuItems,
  pathname,
  isActive,
  onItemClick,
  role,
}: NavLinksProps) => {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
    MODELOS: true, // Open by default for UX
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav className="flex flex-col gap-2 text-[12px]">
      {menuItems.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = openGroups[item.label];

        // Active state for parent: if any child is active or parent itself is active
        const isParentActive = hasChildren
          ? item.children?.some((child) => isActive(child.href))
          : item.href === "/dashboard"
            ? pathname === "/dashboard"
            : isActive(item.href);

        if (hasChildren) {
          return (
            <div key={item.label} className="flex flex-col gap-1">
              <button
                onClick={() => toggleGroup(item.label)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 font-bold ${
                  isParentActive
                    ? "text-primary bg-primary/5"
                    : "text-foreground/70 hover:text-foreground hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  {Icon && (
                    <Icon
                      size={18}
                      className={isParentActive ? "text-primary" : "opacity-70"}
                    />
                  )}
                  <span className="tracking-wide uppercase font-black text-[11px]">
                    {item.label}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>

              {isExpanded && (
                <div className="flex flex-col gap-1 ml-4 pl-4 border-l border-white/5 animate-in slide-in-from-top-2 duration-300">
                  {item.children?.map((child) => {
                    const ChildIcon =
                      iconMap[child.icon as keyof typeof iconMap];
                    const isChildActive = isActive(child.href);

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onItemClick}
                        className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 ${
                          isChildActive
                            ? "text-primary font-bold bg-primary/10"
                            : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        {ChildIcon && (
                          <ChildIcon size={14} className="opacity-70" />
                        )}
                        <span className="font-bold">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 font-bold ${
              isParentActive
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-foreground/80 hover:text-foreground hover:bg-white/5"
            }`}
            href={item.href}
            onClick={onItemClick}
          >
            {Icon && (
              <Icon size={18} className={isParentActive ? "" : "opacity-70"} />
            )}
            <span className="tracking-wide">{item.label}</span>
          </Link>
        );
      })}

      <div className="h-px my-4 bg-white/5" />

      {role === "superadmin" && (
        <Link
          className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-300 ${
            isActive(SETTINGS_ITEM.href)
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-foreground/80 hover:text-foreground hover:bg-white/5"
          }`}
          href={SETTINGS_ITEM.href}
          onClick={onItemClick}
        >
          <Settings
            size={18}
            className={isActive(SETTINGS_ITEM.href) ? "" : "opacity-70"}
          />
          <span className="tracking-wide uppercase font-black text-[11px]">
            {SETTINGS_ITEM.label}
          </span>
        </Link>
      )}
    </nav>
  );
};

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    isApproved?: boolean;
    isActive?: boolean;
  };
}

export default function Sidebar({ user: initialUser }: SidebarProps) {
  const pathname = usePathname() ?? "";
  const { data: session } = useSession();

  // Usar el usuario inicial del servidor si está disponible, sino usar la sesión del cliente
  const user = initialUser || session?.user;
  const userRole = (user?.role || "user") as UserRole;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Obtener items del menú según el rol
  const menuItems = getMenuItems(userRole);

  const handleItemClick = () => setMobileOpen(false);

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
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-secondary text-secondary-foreground p-6 overflow-hidden">
        <div className="mb-8 flex flex-col items-center w-full">
          <Image
            src="/logo.svg"
            alt="ITTrade"
            width={120}
            height={36}
            className="mb-4"
          />
          <div className="h-px w-full bg-[var(--border)]" />
        </div>
        <NavLinks
          menuItems={menuItems}
          pathname={pathname}
          isActive={isActive}
          onItemClick={handleItemClick}
          role={userRole}
        />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-secondary text-secondary-foreground p-6 z-50 overflow-hidden">
            <div className="mb-8 flex flex-col items-center w-full">
              <Image
                src="/logo.svg"
                alt="ITTrade"
                width={120}
                height={36}
                className="mb-4"
              />
              <div className="h-px w-full bg-[var(--border)]" />
            </div>
            <NavLinks
              menuItems={menuItems}
              pathname={pathname}
              isActive={isActive}
              onItemClick={handleItemClick}
              role={userRole}
            />
          </aside>
        </>
      )}
    </>
  );
}
