export type RfidReaderState = "disconnected" | "connecting" | "connected";

export type RfidReaderStatus = {
  state: RfidReaderState;
  /** Reader battery level 0–100. Null when the reader is not connected or has not reported yet. */
  batteryPercent: number | null;
};

export type RfidPeripheral = {
  id: string;
  name: string;
  /** BLE signal strength (dBm). Null for non-BLE transports. */
  rssi: number | null;
};

export type RfidStatusListener = (status: RfidReaderStatus) => void;

/**
 * A card currently held against the reader. UID is available immediately;
 * `readSecret` performs an authenticated READ of blocks 1,2 of each sector.
 */
export type ScannedCard = {
  uid: string;
  /**
   * Authenticate with the given sector-key hex (192 chars, 96 bytes) and read
   * the 1024-char (512-byte) payload from blocks 1,2 of each of the 16 sectors.
   */
  readSecret(key: string): Promise<string>;
};

export interface RfidReader {
  getStatus(): RfidReaderStatus;

  /** Scan for nearby readers. BLE: live scan. Serial: the plugged device. */
  discover(): Promise<RfidPeripheral[]>;

  /** Save the chosen peripheral as the single paired reader and connect. */
  pair(peripheralId: string): Promise<void>;

  /** Currently-paired peripheral ID, or null if none. */
  getPairedPeripheralId(): string | null;

  /** Clear the paired peripheral (and disconnect). */
  forget(): Promise<void>;

  /** Connect to the currently-paired peripheral. Throws if none is paired. */
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  onStatusChange(listener: RfidStatusListener): () => void;

  /** Wait for a card to be presented, then return its UID + a reader for its secret blocks. */
  scanCard(): Promise<ScannedCard>;
}
