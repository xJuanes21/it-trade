"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      signOut({ callbackUrl: "/login", redirect: true });
    });
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isPending}
      className="w-full bg-destructive hover:bg-destructive/90 text-white"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? "Cerrando sesión..." : "Cerrar sesión"}
    </Button>
  );
}
