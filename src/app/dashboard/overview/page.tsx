import TradingDashboard from "@/components/dashboard/finance-overview/TradingDashboard";

export const metadata = {
  title: "Finance Overview - IT Trade",
  description: "Trading performance and financial overview",
};

export default function OverviewPage() {
  return (
    <div className="container mx-auto py-6">
      <TradingDashboard />
    </div>
  );
}
