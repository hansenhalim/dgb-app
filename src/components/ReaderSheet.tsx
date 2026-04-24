import {
  Host,
  ModalBottomSheet,
  RNHostView,
  type ModalBottomSheetRef
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { RfidPeripheral } from "@/domain/ports";
import { colors, fonts, radius } from "@/theme/tokens";

export type ReaderSheetProps = {
  visible: boolean;
  onClose: () => void;
  pairedReaderId: string | null;
  readerState: "disconnected" | "connecting" | "connected";
  readerBatteryPercent: number | null;
  discoverReaders: () => Promise<RfidPeripheral[]>;
  pairReader: (peripheralId: string) => Promise<void>;
  reconnectReader: () => Promise<void>;
  forgetReader: () => Promise<void>;
};

function signalLabel(rssi: number): string {
  if (rssi >= -60) return "Kuat";
  if (rssi >= -75) return "Sedang";
  return "Lemah";
}

export function ReaderSheet({
  visible,
  onClose,
  pairedReaderId,
  readerState,
  readerBatteryPercent,
  discoverReaders,
  pairReader,
  reconnectReader,
  forgetReader,
}: ReaderSheetProps) {
  const [mode, setMode] = useState<"paired" | "picker">(
    pairedReaderId ? "paired" : "picker",
  );
  const [peripherals, setPeripherals] = useState<RfidPeripheral[]>([]);
  const [scanning, setScanning] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pairedDetail, setPairedDetail] = useState<RfidPeripheral | null>(null);
  const [detailScanning, setDetailScanning] = useState(false);
  const sheetRef = useRef<ModalBottomSheetRef>(null);

  useEffect(() => {
    if (!visible) return;
    setMode(pairedReaderId ? "paired" : "picker");
    setError(null);
  }, [visible, pairedReaderId]);

  const runScan = useCallback(async () => {
    setScanning(true);
    setError(null);
    try {
      setPeripherals(await discoverReaders());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memindai reader");
    } finally {
      setScanning(false);
    }
  }, [discoverReaders]);

  useEffect(() => {
    if (visible && mode === "picker") {
      runScan();
    }
  }, [visible, mode, runScan]);

  useEffect(() => {
    if (!visible || mode !== "paired" || !pairedReaderId) {
      setPairedDetail(null);
      return;
    }
    let cancelled = false;
    setDetailScanning(true);
    discoverReaders()
      .then((list) => {
        if (cancelled) return;
        setPairedDetail(list.find((p) => p.id === pairedReaderId) ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setPairedDetail(null);
      })
      .finally(() => {
        if (cancelled) return;
        setDetailScanning(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, mode, pairedReaderId, discoverReaders]);

  const dismiss = useCallback(async () => {
    await sheetRef.current?.hide();
    onClose();
  }, [onClose]);

  const handlePair = useCallback(
    async (id: string) => {
      setBusyId(id);
      setError(null);
      try {
        await pairReader(id);
        await dismiss();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memasangkan reader");
      } finally {
        setBusyId(null);
      }
    },
    [pairReader, dismiss],
  );

  const handleReconnect = useCallback(async () => {
    setBusyId("__reconnect");
    setError(null);
    try {
      await reconnectReader();
      await dismiss();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyambungkan reader");
    } finally {
      setBusyId(null);
    }
  }, [reconnectReader, dismiss]);

  const handleSwitch = useCallback(async () => {
    await forgetReader();
    setMode("picker");
  }, [forgetReader]);

  return (
    <Host style={styles.sheetHost}>
      {visible && (
        <ModalBottomSheet
          modifiers={[fillMaxWidth()]}
          ref={sheetRef}
          onDismissRequest={onClose}
          containerColor={colors.bg}
        >
          <RNHostView matchContents>
            <View style={styles.body}>
              <View style={styles.header}>
                <Text style={styles.title}>
                  {mode === "paired" ? "READER" : "PILIH READER"}
                </Text>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              {mode === "paired" && pairedReaderId ? (
                <View style={styles.pairedBody}>
                  <Text style={styles.pairedName}>
                    {pairedDetail?.name ?? "Reader"}
                  </Text>
                  <Text style={styles.pairedId}>{pairedReaderId}</Text>

                  <View style={styles.metaGrid}>
                    <View style={styles.metaCell}>
                      <Text style={styles.metaKey}>STATUS</Text>
                      <Text style={styles.metaValue}>
                        {readerState === "connected"
                          ? "Terhubung"
                          : readerState === "connecting"
                            ? "Menyambungkan…"
                            : "Tidak terhubung"}
                      </Text>
                    </View>
                    <View style={styles.metaCell}>
                      <Text style={styles.metaKey}>BATERAI</Text>
                      <Text style={styles.metaValue}>
                        {readerBatteryPercent !== null
                          ? `${readerBatteryPercent}%`
                          : "—"}
                      </Text>
                    </View>
                    <View style={styles.metaCell}>
                      <Text style={styles.metaKey}>SINYAL</Text>
                      <Text style={styles.metaValue}>
                        {detailScanning && !pairedDetail
                          ? "Memindai…"
                          : pairedDetail?.rssi !== undefined &&
                              pairedDetail?.rssi !== null
                            ? `${signalLabel(pairedDetail.rssi)} · ${pairedDetail.rssi} dBm`
                            : "—"}
                      </Text>
                    </View>
                  </View>

                  {readerState !== "connected" ? (
                    <Pressable
                      style={[
                        styles.primaryBtn,
                        busyId && styles.btnDisabled,
                      ]}
                      disabled={!!busyId}
                      onPress={handleReconnect}
                    >
                      <Text style={styles.primaryBtnText}>
                        {busyId === "__reconnect"
                          ? "Menyambungkan…"
                          : "Sambung Ulang"}
                      </Text>
                    </Pressable>
                  ) : null}

                  <Pressable
                    style={styles.secondaryBtn}
                    disabled={!!busyId}
                    onPress={handleSwitch}
                  >
                    <Text style={styles.secondaryBtnText}>
                      Pilih Reader Lain
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.pickerBody}>
                  {scanning ? (
                    <View style={styles.scanRow}>
                      <ActivityIndicator color={colors.inkMuted} />
                      <Text style={styles.scanText}>Mencari reader…</Text>
                    </View>
                  ) : peripherals.length === 0 ? (
                    <Text style={styles.emptyText}>
                      Tidak ada reader ditemukan.
                    </Text>
                  ) : (
                    peripherals.map((p) => (
                      <Pressable
                        key={p.id}
                        style={[
                          styles.peripheral,
                          busyId === p.id && styles.btnDisabled,
                        ]}
                        disabled={!!busyId}
                        onPress={() => handlePair(p.id)}
                      >
                        <View style={styles.peripheralMain}>
                          <Text style={styles.peripheralName}>{p.name}</Text>
                          <Text style={styles.peripheralId}>{p.id}</Text>
                        </View>
                        <Text style={styles.peripheralRssi}>
                          {p.rssi !== null ? `${p.rssi} dBm` : "—"}
                        </Text>
                      </Pressable>
                    ))
                  )}

                  <Pressable
                    style={styles.secondaryBtn}
                    disabled={scanning || !!busyId}
                    onPress={runScan}
                  >
                    <Text style={styles.secondaryBtnText}>
                      {scanning ? "Memindai…" : "Pindai Ulang"}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </RNHostView>
        </ModalBottomSheet>
      )}
    </Host>
  );
}

const styles = StyleSheet.create({
  sheetHost: {
    position: "absolute",
    width: "100%",
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: fonts.mono,
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: 1.2,
  },
  closeText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.inkMuted,
    letterSpacing: 1,
  },
  error: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.red,
    letterSpacing: 0.4,
  },
  pairedBody: {
    gap: 8,
  },
  pairedName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: -0.2,
  },
  pairedId: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.inkMuted,
    letterSpacing: 0.4,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.base,
    overflow: "hidden",
  },
  metaCell: {
    flexBasis: "50%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 2,
  },
  metaKey: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.inkDim,
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 13,
    color: colors.ink2,
  },
  pickerBody: {
    gap: 8,
  },
  scanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
  },
  scanText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.inkMuted,
    letterSpacing: 0.6,
  },
  emptyText: {
    fontSize: 13,
    color: colors.inkMuted,
    paddingVertical: 10,
  },
  peripheral: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.base,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  peripheralMain: {
    flex: 1,
    gap: 2,
  },
  peripheralName: {
    fontSize: 14,
    color: colors.ink,
    fontWeight: "600",
  },
  peripheralId: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.inkMuted,
  },
  peripheralRssi: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.inkDim,
  },
  primaryBtn: {
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    borderRadius: radius.base,
    paddingVertical: 14,
  },
  primaryBtnText: {
    color: colors.accentInk,
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.base,
    paddingVertical: 12,
  },
  secondaryBtnText: {
    color: colors.ink2,
    fontSize: 14,
    fontWeight: "500",
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
