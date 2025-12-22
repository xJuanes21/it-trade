"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

const DEFAULT_BG = "/images/bg-login.svg";

function getBackground(pathname: string | null): string {
  if (!pathname) return DEFAULT_BG;
  if (pathname.includes("register")) return "/images/bg-register.svg";
  return DEFAULT_BG;
}

export function AuthBackground({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const background = getBackground(pathname);

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="flex w-full max-w-xl flex-col items-center gap-6">
        <Image
          src="/logo.svg"
          alt="iTtrade Logo"
          width={220}
          height={80}
          priority
          className="drop-shadow-lg"
        />
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
