import { useCallback, useEffect, useState } from "react";

import { useServices } from "@/config/container";
import type { Session } from "@/domain/entities";
import { LoginError, type RfidReaderStatus } from "@/domain/ports";

export type LoginPhase = "idle" | "scanning" | "verifying";

export type LoginViewModel = {
  pin: string;
  setPin: (next: string) => void;
  readerConnected: boolean;
  phase: LoginPhase;
  error: string | null;
  canSubmit: boolean;
  submit: () => Promise<Session | null>;
};

const PIN_LENGTH = 6;

export function useLoginViewModel(): LoginViewModel {
  const { auth, rfid } = useServices();
  const [pin, setPinState] = useState("");
  const [status, setStatus] = useState<RfidReaderStatus>(rfid.getStatus());
  const [phase, setPhase] = useState<LoginPhase>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus(rfid.getStatus());
    return rfid.onStatusChange(setStatus);
  }, [rfid]);

  const setPin = useCallback((next: string) => {
    const digits = next.replace(/\D/g, "").slice(0, PIN_LENGTH);
    setPinState(digits);
    setError(null);
  }, []);

  const readerConnected = status.state === "connected";
  const canSubmit =
    readerConnected && pin.length === PIN_LENGTH && phase === "idle";

  const submit = useCallback(async (): Promise<Session | null> => {
    if (!canSubmit) return null;
    setError(null);
    setPhase("scanning");
    try {
      const card = await rfid.scanCard();
      setPhase("verifying");
      const session = await auth.login(pin, card);
      setPhase("idle");
      return session;
    } catch (e) {
      setPhase("idle");
      if (e instanceof LoginError) {
        setError(e.message);
        if (e.code === "invalid_pin") setPinState("");
      } else {
        setError(e instanceof Error ? e.message : "Gagal masuk.");
      }
      return null;
    }
  }, [auth, rfid, pin, canSubmit]);

  return {
    pin,
    setPin,
    readerConnected,
    phase,
    error,
    canSubmit,
    submit,
  };
}
