import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ServicesProvider, useServices } from "@/config/container";
import { SessionProvider, useSession } from "@/config/session";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const onLogin = segments[0] === "login";
    if (!session && !onLogin) {
      router.replace("/login");
    } else if (session && onLogin) {
      router.replace("/");
    }
  }, [loading, session, segments, router]);

  if (loading) return null;
  return <>{children}</>;
}

function ReaderBootstrap() {
  const { rfid } = useServices();
  useEffect(() => {
    if (rfid.getPairedPeripheralId() && rfid.getStatus().state !== "connected") {
      rfid.connect().catch(() => { });
    }
  }, [rfid]);
  return null;
}

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <ServicesProvider>
        <SessionProvider>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <ReaderBootstrap />
            <AuthGate>
              <Stack screenOptions={{ headerShown: false }} />
            </AuthGate>
          </SafeAreaProvider>
        </SessionProvider>
      </ServicesProvider>
    </KeyboardProvider>
  );
}
