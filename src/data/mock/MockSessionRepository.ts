import type { Gate } from "@/domain/entities";
import type { DashboardSnapshot, SessionRepository } from "@/domain/ports";

import { delay } from "./latency";

const RFID_KEY = "C0FFEE".repeat(32);

const gates: Gate[] = [
  { id: 1, name: "Gerbang 1", currentQuota: 55, isAvailable: true },
  { id: 2, name: "Gerbang 2", currentQuota: 45, isAvailable: true },
  { id: 3, name: "Gerbang 3", currentQuota: 55, isAvailable: true },
  { id: 4, name: "Gerbang 4", currentQuota: 0, isAvailable: false },
];

export class MockSessionRepository implements SessionRepository {
  private currentGateId = 1;

  async getDashboard(): Promise<DashboardSnapshot> {
    await delay(120);
    const gate = gates.find((g) => g.id === this.currentGateId) ?? gates[0];
    return {
      gate,
      cardStock: { available: 50, total: 55 },
      visits: { total: 28, active: 12 },
    };
  }

  async listGates(): Promise<Gate[]> {
    await delay(60);
    return [...gates];
  }

  async setGate(gateId: number): Promise<void> {
    await delay(60);
    if (!gates.some((g) => g.id === gateId)) {
      throw new Error(`Unknown gate: ${gateId}`);
    }
    this.currentGateId = gateId;
  }

  async getRfidKey(_uid: string): Promise<string> {
    await delay(150);
    return RFID_KEY;
  }
}
