"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

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
          ? "bg-background/80 backdrop-blur-md border-b border-white/5 py-2 shadow-lg shadow-black/20"
          : "bg-transparent py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-12 w-12 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo.svg"
                alt="IT Trade Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              IT <span className="text-blue-500">TRADE</span>
            </span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-10">
            <Link
              href="#features"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group"
            >
              Características
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="#stats"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group"
            >
              Rendimiento
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group"
            >
              Cómo Funciona
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="neumorphic-button flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-600/10 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] group"
            >
              Comenzar
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
