import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useServices } from "@/config/container";
import type { RfidReaderStatus } from "@/domain/ports";
import { colors, fonts } from "@/theme/tokens";

import { ReaderSheet } from "./ReaderSheet";

const appVersion = Constants.expoConfig?.version ?? "";

export function useReaderStatus(): RfidReaderStatus {
  const { rfid } = useServices();
  const [status, setStatus] = useState<RfidReaderStatus>(rfid.getStatus());
  useEffect(() => {
    setStatus(rfid.getStatus());
    return rfid.onStatusChange(setStatus);
  }, [rfid]);
  return status;
}

export function AppStatusBar() {
  const { rfid } = useServices();
  const [status, setStatus] = useState<RfidReaderStatus>(rfid.getStatus());
  const [pairedId, setPairedId] = useState<string | null>(
    rfid.getPairedPeripheralId(),
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setStatus(rfid.getStatus());
    setPairedId(rfid.getPairedPeripheralId());
    return rfid.onStatusChange(setStatus);
  }, [rfid]);

  const discover = useCallback(() => rfid.discover(), [rfid]);

  const pair = useCallback(
    async (id: string) => {
      await rfid.pair(id);
      setPairedId(rfid.getPairedPeripheralId());
    },
    [rfid],
  );

  const reconnect = useCallback(async () => {
    await rfid.connect();
  }, [rfid]);

  const forget = useCallback(async () => {
    await rfid.forget();
    setPairedId(null);
  }, [rfid]);

  const connected = status.state === "connected";

  return (
    <>
      <View style={styles.bar}>
        <Text style={styles.text}>v{appVersion}</Text>
        <Pressable
          style={styles.right}
          onPress={() => setSheetOpen(true)}
          hitSlop={8}
        >
          <View style={styles.chip}>
            <View style={[styles.dot, !connected && styles.dotOff]} />
            <Text
              style={[
                styles.text,
                styles.chipText,
                !connected && styles.chipTextOff,
              ]}
            >
              READER
            </Text>
          </View>
          {connected && status.batteryPercent !== null ? (
            <Text style={styles.text}>{status.batteryPercent}%</Text>
          ) : null}
        </Pressable>
      </View>

      <ReaderSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        pairedReaderId={pairedId}
        readerState={status.state}
        readerBatteryPercent={status.batteryPercent}
        discoverReaders={discover}
        pairReader={pair}
        reconnectReader={reconnect}
        forgetReader={forget}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  text: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.inkMuted,
    letterSpacing: 0.8,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  dotOff: {
    backgroundColor: colors.inkMuted,
  },
  chipText: {
    color: colors.green,
  },
  chipTextOff: {
    color: colors.inkMuted,
  },
});
