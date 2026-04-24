import type {
  RfidPeripheral,
  RfidReader,
  RfidReaderStatus,
  RfidStatusListener,
  ScannedCard,
} from "@/domain/ports";

const CONNECTED_BATTERY = 85;

const FAKE_PERIPHERALS: RfidPeripheral[] = [
  { id: "DE:AD:BE:EF:00:01", name: "P3VC-RFID-01", rssi: -42 },
  { id: "DE:AD:BE:EF:00:02", name: "P3VC-RFID-02", rssi: -68 },
  { id: "DE:AD:BE:EF:00:03", name: "P3VC-RFID-03", rssi: -85 },
];

const FAKE_UID = "A1B2C3D4";
const FAKE_SECRET = "0".repeat(1024); // Blank card — triggers the new-visitor flow on home scan.

export class MockRfidReader implements RfidReader {
  private status: RfidReaderStatus = {
    state: "disconnected",
    batteryPercent: null,
  };
  private pairedId: string | null = null;
  private statusListeners = new Set<RfidStatusListener>();

  getStatus(): RfidReaderStatus {
    return this.status;
  }

  async discover(): Promise<RfidPeripheral[]> {
    await new Promise((r) => setTimeout(r, 400));
    return [...FAKE_PERIPHERALS];
  }

  async pair(peripheralId: string): Promise<void> {
    const found = FAKE_PERIPHERALS.find((p) => p.id === peripheralId);
    if (!found) {
      throw new Error(`Unknown peripheral: ${peripheralId}`);
    }
    this.pairedId = peripheralId;
    await this.connect();
  }

  getPairedPeripheralId(): string | null {
    return this.pairedId;
  }

  async forget(): Promise<void> {
    await this.disconnect();
    this.pairedId = null;
  }

  async connect(): Promise<void> {
    if (!this.pairedId) {
      throw new Error("No reader paired");
    }
    this.setStatus({ state: "connecting", batteryPercent: null });
    await new Promise((r) => setTimeout(r, 200));
    this.setStatus({ state: "connected", batteryPercent: CONNECTED_BATTERY });
  }

  async disconnect(): Promise<void> {
    this.setStatus({ state: "disconnected", batteryPercent: null });
  }

  onStatusChange(listener: RfidStatusListener): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  async scanCard(): Promise<ScannedCard> {
    if (this.status.state !== "connected") {
      throw new Error("Reader tidak terhubung.");
    }
    await new Promise((r) => setTimeout(r, 600));
    return {
      uid: FAKE_UID,
      async readSecret(_key: string): Promise<string> {
        await new Promise((r) => setTimeout(r, 200));
        return FAKE_SECRET;
      },
    };
  }

  /** Dev helper — simulate reader battery drain from UI or tests. */
  setBatteryPercent(batteryPercent: number | null): void {
    this.setStatus({ ...this.status, batteryPercent });
  }

  private setStatus(next: RfidReaderStatus): void {
    this.status = next;
    this.statusListeners.forEach((l) => l(next));
  }
}
