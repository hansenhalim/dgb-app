import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppStatusBar,
  useReaderStatus,
  type AppStatusBarHandle,
} from "@/components/AppStatusBar";
import {
  CaretDown,
  ChevronRight,
  LogOut,
  WarningTriangle,
} from "@/components/icons";
import { useSession } from "@/config/session";
import { colors, fonts, radius } from "@/theme/tokens";

import { GateSheet } from "./GateSheet";
import { useHomeViewModel } from "./useHomeViewModel";
import { useScanViewModel } from "./useScanViewModel";

const LOW_BATTERY_THRESHOLD = 20;

export default function HomeScreen() {
  const vm = useHomeViewModel();
  const scan = useScanViewModel();
  const { session, logout } = useSession();
  const readerStatus = useReaderStatus();
  const statusBarRef = useRef<AppStatusBarHandle>(null);
  const [gateSheetOpen, setGateSheetOpen] = useState(false);

  const lowBattery =
    readerStatus.state === "connected" &&
    readerStatus.batteryPercent !== null &&
    readerStatus.batteryPercent < LOW_BATTERY_THRESHOLD;

  const onLogout = useCallback(async () => {
    await logout();
    router.replace("/login");
  }, [logout]);

  const onScan = useCallback(async () => {
    const result = await scan.submit();
    if (result?.isEmpty) {
      router.push("/capture-id");
    }
  }, [scan]);

  const scanLabel =
    scan.phase === "scanning"
      ? "Memindai Kartu…"
      : scan.phase === "reading"
        ? "Membaca Kartu…"
        : !scan.readerConnected
          ? "Pilih Reader"
          : "Scan Kartu RFID";

  const scanBusy = scan.phase !== "idle";
  const scanButtonEnabled = !scanBusy;
  const onScanButtonPress = !scan.readerConnected
    ? () => statusBarRef.current?.openReaderSheet()
    : onScan;

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <AppStatusBar ref={statusBarRef} />

      <View style={styles.phead}>
        <View style={styles.guardGroup}>
          <Text style={styles.guardName}>{session?.guardName ?? "—"}</Text>
          <Pressable
            style={styles.logoutButton}
            hitSlop={8}
            onPress={onLogout}
          >
            <LogOut size={16} color={colors.inkMuted} />
          </Pressable>
        </View>

        <Pressable
          style={styles.gatePill}
          onPress={() => setGateSheetOpen(true)}
          hitSlop={8}
        >
          <Text style={styles.gateKey}>POS</Text>
          <Text style={styles.gateValue}>{vm.gate?.name ?? "—"}</Text>
          <CaretDown size={10} color={colors.inkMuted} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statRow}>
          <Pressable style={[styles.stat, vm.lowStock && styles.statAlert]}>
            <View style={styles.statChev}>
              <ChevronRight size={12} color={colors.inkDim} />
            </View>
            <Text style={styles.statKey}>KARTU RFID</Text>
            <View style={styles.statBigRow}>
              <Text
                style={[styles.statBig, vm.lowStock && styles.statBigAlert]}
              >
                {vm.cardStock?.available ?? "—"}
              </Text>
              <Text style={styles.statBigOf}>/{vm.cardStock?.total ?? "—"}</Text>
            </View>
          </Pressable>

          <Pressable style={styles.stat}>
            <View style={styles.statChev}>
              <ChevronRight size={12} color={colors.inkDim} />
            </View>
            <Text style={styles.statKey}>JUMLAH KUNJUNGAN</Text>
            <View style={styles.statBigRow}>
              <Text style={styles.statBig}>{vm.visits?.total ?? "—"}</Text>
              <Text style={styles.statBigOf}>
                ·{vm.visits?.active ?? 0} aktif
              </Text>
            </View>
          </Pressable>
        </View>

        {lowBattery ? (
          <View style={styles.banner}>
            <WarningTriangle size={20} color={colors.red} />
            <View style={styles.bannerBody}>
              <Text style={styles.bannerTitle}>BATERAI READER MENIPIS</Text>
              <Text style={styles.bannerText}>
                Siapkan baterai cadangan. Matikan reader untuk mengganti baterai.
              </Text>
            </View>
          </View>
        ) : null}

        {vm.lowStock ? (
          <View style={styles.banner}>
            <WarningTriangle size={20} color={colors.red} />
            <View style={styles.bannerBody}>
              <Text style={styles.bannerTitle}>STOK KARTU RFID MENIPIS</Text>
              <Text style={styles.bannerText}>
                Minta transfer dari pos gerbang terdekat.
              </Text>
            </View>
          </View>
        ) : null}

        {vm.error ? (
          <View style={styles.banner}>
            <WarningTriangle size={20} color={colors.red} />
            <View style={styles.bannerBody}>
              <Text style={styles.bannerTitle}>GAGAL MEMUAT</Text>
              <Text style={styles.bannerText}>{vm.error}</Text>
            </View>
          </View>
        ) : null}

        {scan.error ? (
          <View style={styles.banner}>
            <WarningTriangle size={20} color={colors.red} />
            <View style={styles.bannerBody}>
              <Text style={styles.bannerTitle}>GAGAL SCAN</Text>
              <Text style={styles.bannerText}>{scan.error}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <SafeAreaView style={styles.fabBar} edges={["bottom", "left", "right"]}>
        <Pressable
          style={[styles.scanButton, !scanButtonEnabled && styles.scanButtonDisabled]}
          disabled={!scanButtonEnabled}
          onPress={onScanButtonPress}
        >
          <Text
            style={[styles.scanText, !scanButtonEnabled && styles.scanTextDisabled]}
          >
            {scanLabel}
          </Text>
        </Pressable>
      </SafeAreaView>

      <GateSheet
        visible={gateSheetOpen}
        onClose={() => setGateSheetOpen(false)}
        currentGateId={vm.gate?.id ?? null}
        listGates={vm.listGates}
        selectGate={vm.selectGate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // page header
  phead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    gap: 12,
  },
  guardGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  guardName: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: -0.07,
  },
  logoutButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  gatePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 8,
  },
  gateKey: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.inkDim,
    letterSpacing: 1,
  },
  gateValue: {
    fontSize: 12,
    color: colors.ink2,
  },
  // content
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },

  // stat row
  statRow: {
    flexDirection: "row",
    gap: 8,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.base,
    padding: 14,
  },
  statKey: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.inkMuted,
    letterSpacing: 1,
  },
  statBigRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 4,
  },
  statBig: {
    fontFamily: fonts.mono,
    fontSize: 34,
    fontWeight: "500",
    color: colors.ink,
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  statBigAlert: {
    color: colors.red,
  },
  statAlert: {
    borderColor: "rgba(185,28,28,0.40)",
  },
  statBigOf: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.inkMuted,
  },
  statChev: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  // banner
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(185,28,28,0.08)",
    borderWidth: 1,
    borderColor: "rgba(185,28,28,0.30)",
    borderLeftWidth: 4,
    borderLeftColor: colors.red,
    borderRadius: radius.base,
  },
  bannerBody: {
    flex: 1,
    gap: 3,
  },
  bannerTitle: {
    fontFamily: fonts.mono,
    fontSize: 12,
    fontWeight: "700",
    color: colors.red,
    letterSpacing: 1.2,
  },
  bannerText: {
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
  },

  // fab
  fabBar: {
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  scanButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.base,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  scanButtonDisabled: {
    backgroundColor: colors.rule,
    borderColor: colors.ruleStrong,
  },
  scanText: {
    color: colors.accentInk,
    fontSize: 16,
    fontWeight: "600",
  },
  scanTextDisabled: {
    color: colors.inkMuted,
  },
});
