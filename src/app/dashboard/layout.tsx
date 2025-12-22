import React from "react";
import Sidebar from "@/components/shared/Sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="p-4 md:p-8 md:pl-72">
        {children}
      </main>
    </div>
  );
}
