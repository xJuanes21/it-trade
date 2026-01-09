"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-20 w-20">
              <Image 
                src="/logo.svg" 
                alt="IT Trade Logo" 
                fill 
                className="object-contain"
              />
            </div>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Características
            </Link>
            <Link href="#stats" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Rendimiento
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Cómo Funciona
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register"
              className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25"
            >
              Comenzar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
