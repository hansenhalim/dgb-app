import { useCallback, useEffect, useState } from "react";

import { useServices } from "@/config/container";
import type { RfidReaderStatus } from "@/domain/ports";
import { startDraft } from "@/features/visit/visitDraft";

export type ScanPhase = "idle" | "scanning" | "reading";

export type ScanResult = {
  uid: string;
  rfidKey: string;
  secret: string;
  isEmpty: boolean;
};

export type ScanViewModel = {
  readerConnected: boolean;
  phase: ScanPhase;
  error: string | null;
  canSubmit: boolean;
  submit: () => Promise<ScanResult | null>;
};

/** A card is "empty" when its authenticated-read payload is all zeros. */
function isEmptySecret(hex: string): boolean {
  return /^0+$/.test(hex);
}

export function useScanViewModel(): ScanViewModel {
  const { rfid, session } = useServices();
  const [status, setStatus] = useState<RfidReaderStatus>(rfid.getStatus());
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus(rfid.getStatus());
    return rfid.onStatusChange(setStatus);
  }, [rfid]);

  const readerConnected = status.state === "connected";
  const canSubmit = readerConnected && phase === "idle";

  const submit = useCallback(async (): Promise<ScanResult | null> => {
    if (!canSubmit) return null;
    setError(null);
    setPhase("scanning");
    try {
      const card = await rfid.scanCard();
      setPhase("reading");
      const rfidKey = await session.getRfidKey(card.uid);
      const secret = await card.readSecret(rfidKey);
      setPhase("idle");
      const isEmpty = isEmptySecret(secret);
      if (isEmpty) {
        startDraft(card.uid, rfidKey);
      }
      return { uid: card.uid, rfidKey, secret, isEmpty };
    } catch (e) {
      setPhase("idle");
      setError(e instanceof Error ? e.message : "Gagal memindai kartu.");
      return null;
    }
  }, [rfid, session, canSubmit]);

  return {
    readerConnected,
    phase,
    error,
    canSubmit,
    submit,
  };
}
