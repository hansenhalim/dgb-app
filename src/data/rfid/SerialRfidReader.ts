import type {
  RfidPeripheral,
  RfidReader,
  RfidReaderStatus,
  RfidStatusListener,
  ScannedCard,
} from "@/domain/ports";

const NOT_IMPLEMENTED =
  "SerialRfidReader not implemented — wire up USB/serial native module here. " +
  "Wire protocol: SCAN_UID → 'OK UID <hex>'; READ <key> → 'OK DATA <hex_data>'.";

export class SerialRfidReader implements RfidReader {
  getStatus(): RfidReaderStatus {
    return { state: "disconnected", batteryPercent: null };
  }

  async discover(): Promise<RfidPeripheral[]> {
    throw new Error(NOT_IMPLEMENTED);
  }

  async pair(_peripheralId: string): Promise<void> {
    throw new Error(NOT_IMPLEMENTED);
  }

  getPairedPeripheralId(): string | null {
    return null;
  }

  async forget(): Promise<void> {}

  async connect(): Promise<void> {
    throw new Error(NOT_IMPLEMENTED);
  }

  async disconnect(): Promise<void> {}

  onStatusChange(_listener: RfidStatusListener): () => void {
    return () => {};
  }

  async scanCard(): Promise<ScannedCard> {
    throw new Error(NOT_IMPLEMENTED);
  }
}
