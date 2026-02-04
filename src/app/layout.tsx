import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AppProviders } from "@/components/providers/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ittradew.com"),
  title: {
    default: "IT TRADE - Trading Automatizado con IA",
    template: "%s | IT TRADE",
  },
  description:
    "Potencia tus inversiones con nuestros bots de trading impulsados por IA. Operaciones 24/7, análisis en tiempo real y seguridad total para tus fondos.",
  keywords: [
    "trading",
    "forex",
    "crypto",
    "ia",
    "bots",
    "inversiones",
    "trading automatizado",
    "it trade",
  ],
  authors: [{ name: "IT TRADE Team" }],
  creator: "IT TRADE",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://ittradew.com",
    title: "IT TRADE - Trading Automatizado con IA",
    description:
      "Potencia tus inversiones con nuestros bots de trading impulsados por IA. Operaciones 24/7, análisis en tiempo real y seguridad total para tus fondos.",
    siteName: "IT TRADE",
    images: [
      {
        url: "/logo.svg",
        width: 800,
        height: 600,
        alt: "IT TRADE Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IT TRADE - Trading Automatizado con IA",
    description:
      "Potencia tus inversiones con nuestros bots de trading impulsados por IA. Operaciones 24/7, análisis en tiempo real y seguridad total para tus fondos.",
    images: ["/logo.svg"],
    creator: "@ittrade",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          {children}
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--background)",
                border: "1px solid #3b82f6",
                color: "var(--foreground)",
              },
              className: "bg-background text-foreground border-blue-500",
            }}
          />
        </AppProviders>
      </body>
    </html>
  );
}
