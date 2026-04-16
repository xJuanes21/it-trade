import { useState, useEffect, useCallback } from "react";
import { tradeCopierService } from "@/services/trade-copier.service";

export interface RankingEntry {
  rankingId: string;
  account_id: string;
  name: string;
  ownerName: string;
  ownerRole?: string;
  profit: number;
  roi: number;
  drawdown: number;
  equity: number;
  type: number;
  accountCount: number;
  score?: number;
}

export function useGlobalRanking() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  const fetchRanking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // 1. Fetch reporting data with global flag for the Home Ranking
      const reportResponse = await tradeCopierService.getReporting({
        global: true,
      } as any);

      if (reportResponse.status === "error") {
        setError(
          reportResponse.message ||
          "Error al conectar con el servidor de reporting.",
        );
        setRanking([]);
        return;
      }

      if (
        reportResponse.status !== "success" ||
        !reportResponse.data?.reporting
      ) {
        setRanking([]);
        return;
      }

      // 2. Fetch local accounts to get the "proper name"
      let accountNames = new Map();
      try {
        const accountsResponse = await tradeCopierService.getAccounts();
        accountNames = new Map(
          (accountsResponse.data?.accounts || []).map((a: any) => [
            a.account_id,
            a.name,
          ]),
        );
      } catch (accErr) {
        console.warn("Failed to fetch account names for ranking:", accErr);
      }

      const rawData = reportResponse.data?.reporting || [];

      // 3. Map and calculate composite score
      const mappedRanking: RankingEntry[] = rawData.map(
        (rep: any) => {
          const hwm = Number(rep.hwm || 0);
          const equityEnd = rep.equity_end || rep.balance || 0;

          const calcDD =
            hwm > 0 ? Math.max(0, (1 - equityEnd / hwm) * 100) : 0;

          const ownerName = rep.ownerName || "";

          return {
            rankingId: rep.rankingId || String(rep.account_id),
            account_id: String(rep.account_id),
            name:
              rep.ownerName ||
              accountNames.get(rep.account_id) ||
              rep.name ||
              `Cuenta ${rep.account_id}`,
            ownerName,
            profit: Number(rep.pnlUSD || rep.profit || 0),
            roi: Number(rep.performance || rep.roi || 0),
            drawdown:
              typeof rep.drawdown === "number" && rep.drawdown !== 0
                ? rep.drawdown
                : calcDD,
            equity: equityEnd,
            type: typeof rep.type === "number" ? rep.type : parseInt(rep.type || "0"),
            accountCount: Number(rep.traderAccountCount || 0),
            ownerRole: rep.ownerRole,
          };
        },
      );
      
      // Filter: Master accounts ONLY and EXCLUDE SuperAdmins
      const filteredRanking = mappedRanking.filter(
        (acc) => acc.type === 0 && acc.ownerRole !== "superadmin"
      );

      if (filteredRanking.length > 0) {
        // Calculate composite score using min-max normalization
        const profits = filteredRanking.map((a) => a.profit);
        const rois = filteredRanking.map((a) => a.roi);

        const minProfit = Math.min(...profits);
        const maxProfit = Math.max(...profits);
        const minRoi = Math.min(...rois);
        const maxRoi = Math.max(...rois);

        const WEIGHT_PROFIT = 0.5;
        const WEIGHT_ROI = 0.5;

        const withScores = filteredRanking.map((acc) => {
          const normProfit =
            maxProfit !== minProfit
              ? (acc.profit - minProfit) / (maxProfit - minProfit)
              : 1;
          const normRoi =
            maxRoi !== minRoi ? (acc.roi - minRoi) / (maxRoi - minRoi) : 1;

          const compositeScore =
            normProfit * WEIGHT_PROFIT + normRoi * WEIGHT_ROI;
          return { ...acc, compositeScore };
        });

        withScores.sort((a, b) => b.compositeScore - a.compositeScore);
        setRanking(withScores);
      } else {
        setRanking([]);
      }
    } catch (err: any) {
      console.error("Ranking fetch error:", err);
      setError(
        err.message || "Error al conectar con el servidor de reporting.",
      );
      setRanking([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  return { loading, error, ranking, refetch: fetchRanking };
}
