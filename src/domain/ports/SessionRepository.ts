import type { CardStock, Gate, VisitSummary } from "../entities";

export type DashboardSnapshot = {
  gate: Gate;
  cardStock: CardStock;
  visits: VisitSummary;
};

export interface SessionRepository {
  getDashboard(): Promise<DashboardSnapshot>;
  listGates(): Promise<Gate[]>;
  setGate(gateId: number): Promise<void>;
  getRfidKey(uid: string): Promise<string>;
}
