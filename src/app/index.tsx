import Constants from "expo-constants";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CaretDown,
  ChevronRight,
  LogOut,
  WarningTriangle,
} from "../components/icons";
import { colors, fonts, radius } from "../theme/tokens";

const appVersion = Constants.expoConfig?.version ?? "";

export default function Home() {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.statusbar}>
        <Text style={styles.statusText}>v{appVersion}</Text>
        <View style={styles.statusRight}>
          <View style={styles.bt}>
            <View style={styles.btDot} />
            <Text style={[styles.statusText, styles.btText]}>READER</Text>
          </View>
          <Text style={styles.statusText}>85%</Text>
        </View>
      </View>

      <View style={styles.phead}>
        <View style={styles.guardGroup}>
          <Text style={styles.guardName}>M YANI</Text>
          <Pressable
            style={styles.logoutButton}
            hitSlop={8}
            onPress={() => {}}
          >
            <LogOut size={16} color={colors.inkMuted} />
          </Pressable>
        </View>

        <Pressable style={styles.gatePill}>
          <Text style={styles.gateKey}>POS</Text>
          <Text style={styles.gateValue}>Gerbang Utama</Text>
          <CaretDown size={10} color={colors.inkMuted} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statRow}>
          <Pressable style={[styles.stat, styles.statAlert]}>
            <View style={styles.statChev}>
              <ChevronRight size={12} color={colors.inkDim} />
            </View>
            <Text style={styles.statKey}>KARTU RFID</Text>
            <View style={styles.statBigRow}>
              <Text style={[styles.statBig, styles.statBigAlert]}>47</Text>
              <Text style={styles.statBigOf}>/120</Text>
            </View>
          </Pressable>

          <Pressable style={styles.stat}>
            <View style={styles.statChev}>
              <ChevronRight size={12} color={colors.inkDim} />
            </View>
            <Text style={styles.statKey}>JUMLAH KUNJUNGAN</Text>
            <View style={styles.statBigRow}>
              <Text style={styles.statBig}>28</Text>
              <Text style={styles.statBigOf}>·12 aktif</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.banner}>
          <WarningTriangle size={20} color={colors.red} />
          <View style={styles.bannerBody}>
            <Text style={styles.bannerTitle}>STOK KARTU RFID MENIPIS</Text>
            <Text style={styles.bannerText}>
              Minta transfer dari pos gerbang terdekat.
            </Text>
          </View>
        </View>

      </ScrollView>

      <SafeAreaView style={styles.fabBar} edges={["bottom", "left", "right"]}>
        <Pressable style={styles.scanButton}>
          <Text style={styles.scanText}>Scan Kartu RFID</Text>
        </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // status bar
  statusbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  statusText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.inkMuted,
    letterSpacing: 0.8,
  },
  statusRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  btDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  btText: {
    color: colors.green,
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
  scanText: {
    color: colors.accentInk,
    fontSize: 16,
    fontWeight: "600",
  },
});
