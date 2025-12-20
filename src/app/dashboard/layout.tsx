import React from "react";
import Sidebar from "@/components/shared/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="p-4 md:p-8 md:pl-72">
        {children}
      </main>
    </div>
  );
}
