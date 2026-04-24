import { useCallback, useEffect, useState } from "react";

import { useServices } from "@/config/container";
import type { CardStock, Gate, VisitSummary } from "@/domain/entities";

export type HomeViewModel = {
  loading: boolean;
  error: string | null;
  gate: Gate | null;
  cardStock: CardStock | null;
  visits: VisitSummary | null;
  lowStock: boolean;
  reload: () => Promise<void>;
  listGates: () => Promise<Gate[]>;
  selectGate: (gateId: number) => Promise<void>;
};

const LOW_STOCK_THRESHOLD = 0.2;

export function useHomeViewModel(): HomeViewModel {
  const { session } = useServices();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gate, setGate] = useState<Gate | null>(null);
  const [cardStock, setCardStock] = useState<CardStock | null>(null);
  const [visits, setVisits] = useState<VisitSummary | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboard = await session.getDashboard();
      setGate(dashboard.gate);
      setCardStock(dashboard.cardStock);
      setVisits(dashboard.visits);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  const listGates = useCallback(() => session.listGates(), [session]);

  const selectGate = useCallback(
    async (gateId: number) => {
      await session.setGate(gateId);
      await load();
    },
    [session, load],
  );

  const lowStock =
    cardStock !== null && cardStock.available / cardStock.total < LOW_STOCK_THRESHOLD;

  return {
    loading,
    error,
    gate,
    cardStock,
    visits,
    lowStock,
    reload: load,
    listGates,
    selectGate,
  };
}
