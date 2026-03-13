"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border py-2 shadow-lg"
          : "bg-transparent py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-24 w-24 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo.svg"
                alt="IT Trade Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-10">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Características
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="#stats"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Rendimiento
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Cómo Funciona
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="neumorphic-button flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-6 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-lg group"
            >
              Comenzar
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="ml-4 flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
