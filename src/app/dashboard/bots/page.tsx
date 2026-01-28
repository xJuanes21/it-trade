import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TradingBots from "@/components/dashboard/bots/TradingBots";

export const metadata = {
  title: "Bots",
};

export default async function BotsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <TradingBots
      userRole={session.user.role || "user"}
      userId={session.user.id || ""}
    />
  );
}
