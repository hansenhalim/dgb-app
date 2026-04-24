import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  ApiAuthGateway,
  ApiSessionRepository,
} from "@/data/api";
import {
  MockAuthGateway,
  MockSessionRepository,
} from "@/data/mock";
import {
  BleRfidReader,
  MockRfidReader,
  SerialRfidReader,
} from "@/data/rfid";
import type {
  AuthGateway,
  RfidReader,
  SessionRepository,
} from "@/domain/ports";

import { env, type ApiMode, type RfidTransport } from "./env";

export type Services = {
  auth: AuthGateway;
  session: SessionRepository;
  rfid: RfidReader;
};

function buildServices(
  apiMode: ApiMode,
  rfidTransport: RfidTransport,
): Services {
  const useMock = apiMode === "mock";

  const auth: AuthGateway = useMock
    ? new MockAuthGateway()
    : new ApiAuthGateway();

  const session: SessionRepository = useMock
    ? new MockSessionRepository()
    : new ApiSessionRepository();

  const rfid: RfidReader =
    rfidTransport === "ble"
      ? new BleRfidReader()
      : rfidTransport === "serial"
        ? new SerialRfidReader()
        : new MockRfidReader();

  return { auth, session, rfid };
}

const ServicesContext = createContext<Services | null>(null);

export type ServicesProviderProps = {
  children: ReactNode;
  /** Override services — useful for tests and Storybook. */
  value?: Partial<Services>;
};

export function ServicesProvider({
  children,
  value,
}: ServicesProviderProps) {
  const services = useMemo<Services>(() => {
    const defaults = buildServices(env.apiMode, env.rfidTransport);
    return { ...defaults, ...value };
  }, [value]);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error("useServices must be used inside <ServicesProvider>.");
  }
  return services;
}
