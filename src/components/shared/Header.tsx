"use client";

import { useState } from "react";
import { Search, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { logOut } from "@/lib/auth-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export default function Header({ user: initialUser }: HeaderProps) {
  const { data: session } = useSession();
  const [isNotificationActive, setIsNotificationActive] = useState(true);

  const handleLogout = async () => {
    await logOut();
  };

  const user = initialUser || session?.user;
  const userName = user?.name || "Usuario";
  const userInitial = userName.charAt(0).toUpperCase();
  const getRoleLabel = (r?: string | null) => {
    if (r === "superadmin") return "Super Admin";
    if (r === "trader") return "Trader";
    return "Usuario";
  };
  const userRole = getRoleLabel(user?.role);

  return (
    <header className=" backdrop-blur-md border-b border-border px-6 py-3 sticky top-0 z-40 bg-background/80">
      <div className="flex items-center justify-end gap-4">
        {/* Search Bar - Hidden on mobile, visible on medium screens and up
        <div className="relative hidden md:block flex-1 max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Search size={16} className="text-primary-foreground" />
            </div>
          </div>
          <input
            type="text"
            placeholder="Buscar mercados, bots, señales..."
            className="w-full bg-card text-sm text-foreground pl-14 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-primary/50 focus:bg-accent/5 placeholder:text-muted-foreground transition-all"
          />
        </div>
        */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Separator */}
          <div className="h-8 w-[1px] bg-border hidden sm:block"></div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-secondary/50 p-1.5 pr-3 rounded-full border border-transparent hover:border-border transition-all outline-none">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border-2 border-border shadow-sm bg-gradient-to-br from-blue-600 to-purple-600 text-primary-foreground font-bold text-sm">
                {userInitial}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground leading-none">
                  {userName}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {userRole}
                </span>
              </div>
              <ChevronDown size={14} className="text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-popover border border-border rounded-xl p-1.5 shadow-xl backdrop-blur-xl"
            >
              <div className="px-2 py-1.5 mb-1 border-b border-border sm:hidden">
                <p className="text-sm font-medium text-foreground">
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 text-destructive hover:text-destructive-foreground hover:bg-destructive rounded-lg cursor-pointer transition-colors"
              >
                <LogOut size={16} />
                <span className="font-medium">Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
