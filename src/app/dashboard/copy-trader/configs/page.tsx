import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ConfigsView from "@/components/dashboard/copy-trader/ConfigsView";

export default async function ConfigsPage() {
  const session = await auth();

  // Basic layout level RBAC: ONLY Superadmin or trader
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "superadmin" && session.user.role !== "trader") {
    redirect("/dashboard/copy-trader/accounts");
  }

  return <ConfigsView />;
}
