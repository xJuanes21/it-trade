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
  const userRole = user?.role === "superadmin" ? "Super Admin" : "Usuario";

  return (
    <header className=" backdrop-blur-md border-b border-[#2a3050] px-6 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-end gap-4">
        {/* Search Bar - Hidden on mobile, visible on medium screens and up */}
        <div className="relative hidden md:block flex-1 max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Search size={16} className="text-white" />
            </div>
          </div>
          <input
            type="text"
            placeholder="Buscar mercados, bots, señales..."
            className="w-full bg-[#0f1420] text-sm text-white pl-14 pr-4 py-2.5 rounded-xl border border-[#2a3050] focus:outline-none focus:border-blue-500/50 focus:bg-[#151a2d] placeholder:text-slate-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            className="relative p-2.5 hover:bg-[#2a3050] rounded-xl transition-all group"
            onClick={() => setIsNotificationActive(!isNotificationActive)}
          >
            <Bell
              size={20}
              className="text-slate-400 group-hover:text-blue-400 transition-colors"
            />
            {isNotificationActive && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a1f3a] shadow-sm shadow-red-500/50"></span>
            )}
          </button>

          {/* Separator */}
          <div className="h-8 w-[1px] bg-[#2a3050] hidden sm:block"></div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-[#2a3050]/50 p-1.5 pr-3 rounded-full border border-transparent hover:border-[#2a3050] transition-all outline-none">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border-2 border-[#2a3050] shadow-sm bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm">
                {userInitial}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-white leading-none">
                  {userName}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {userRole}
                </span>
              </div>
              <ChevronDown size={14} className="text-slate-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-[#1a1f3a] border border-[#2a3050] rounded-xl p-1.5 shadow-xl backdrop-blur-xl"
            >
              <div className="px-2 py-1.5 mb-1 border-b border-[#2a3050]/50 sm:hidden">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-slate-400">{userRole}</p>
              </div>
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
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
