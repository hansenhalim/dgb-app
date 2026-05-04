import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppStatusBar } from "@/components/AppStatusBar";
import {
  clearDraft,
  getDraft,
  updateDraft,
  type Keperluan,
} from "@/features/visit/visitDraft";
import { useTheme } from "@/theme/theme";
import { fonts, radius, type Colors } from "@/theme/tokens";

const KEPERLUAN_OPTIONS: Keperluan[] = [
  "Bertamu",
  "Antar Jemput",
  "Pengantaran barang",
  "Lainnya",
];

const formatPlate = (raw: string) =>
  raw
    .replace(/\s+/g, "")
    .toUpperCase()
    .replace(/([A-Z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Z])/g, "$1 $2");

export default function GuestFormScreen() {
  const draft = getDraft();
  const { width } = useWindowDimensions();
  const isTablet = width >= 640;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [nik, setNik] = useState(draft?.nik ?? "");
  const [nama, setNama] = useState(draft?.nama ?? "");
  const [plat, setPlat] = useState(draft?.plat ?? "");
  const handlePlatChange = useCallback(
    (v: string) => setPlat(formatPlate(v)),
    [],
  );
  const [tujuan, setTujuan] = useState(draft?.tujuan ?? "");
  const [keperluan, setKeperluan] = useState<Keperluan | null>(
    draft?.keperluan ?? null,
  );
  const [keperluanOther, setKeperluanOther] = useState(
    draft?.keperluanOther ?? "",
  );
  const [saving, setSaving] = useState(false);

  const keperluanComplete =
    keperluan !== null &&
    (keperluan !== "Lainnya" || keperluanOther.trim().length > 0);

  const canSave =
    !saving &&
    nik.trim().length > 0 &&
    nama.trim().length > 0 &&
    tujuan.trim().length > 0 &&
    keperluanComplete;

  const onSave = useCallback(async () => {
    if (!canSave || !keperluan) return;
    setSaving(true);
    updateDraft({
      nik: nik.trim(),
      nama: nama.trim(),
      plat: plat.trim(),
      tujuan: tujuan.trim(),
      keperluan,
      keperluanOther:
        keperluan === "Lainnya" ? keperluanOther.trim() : undefined,
    });
    // TODO: submit to server once the register-visit endpoint is defined.
    clearDraft();
    router.dismissAll();
  }, [canSave, keperluan, keperluanOther, nik, nama, plat, tujuan]);

  if (!draft) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
        <AppStatusBar />
        <View style={styles.emptyBox}>
          <Text style={styles.brandKey}>SESI TIDAK AKTIF</Text>
          <Text style={styles.title}>Mulai pemindaian ulang</Text>
          <Text style={styles.subtitle}>
            Data kunjungan tidak ditemukan. Kembali ke beranda dan pindai kartu tamu lagi.
          </Text>
          <Pressable style={styles.cta} onPress={() => router.dismissAll()}>
            <Text style={styles.ctaText}>Kembali ke Beranda</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <AppStatusBar />

      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bottomOffset={80}
      >
        <View style={[styles.layout, isTablet && styles.layoutTablet]}>
          {draft.photoUri ? (
            <View style={[styles.column, isTablet && styles.columnLeft]}>
              <View style={styles.photoCard}>
                <Image
                  source={{ uri: draft.photoUri }}
                  style={styles.photo}
                  contentFit="cover"
                />
                <View style={styles.photoMeta}>
                  <Text style={styles.metaKey}>FOTO KARTU IDENTITAS</Text>
                  <Pressable onPress={() => router.back()} hitSlop={8}>
                    <Text style={styles.metaAction}>Ambil Ulang</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}

          <View style={[styles.column, isTablet && styles.columnRight]}>
            <View style={styles.field}>
              <Text style={styles.label}>NIK</Text>
              <TextInput
                style={styles.input}
                value={nik}
                onChangeText={(t) => setNik(t.replace(/\D/g, "").slice(0, 16))}
                keyboardType="number-pad"
                maxLength={16}
                autoCorrect={false}
                placeholder="1234567890123456"
                placeholderTextColor={colors.inkDim}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nama</Text>
              <TextInput
                style={styles.input}
                value={nama}
                onChangeText={setNama}
                autoCorrect={false}
                placeholder="JOHN DOE"
                placeholderTextColor={colors.inkDim}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>No. Plat</Text>
              <TextInput
                style={styles.input}
                value={plat}
                onChangeText={handlePlatChange}
                keyboardType="visible-password"
                autoCorrect={false}
                placeholder="BE 1234 CD"
                placeholderTextColor={colors.inkDim}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Tujuan</Text>
              <TextInput
                style={styles.input}
                value={tujuan}
                onChangeText={setTujuan}
                autoCorrect={false}
                placeholder="AA-1"
                placeholderTextColor={colors.inkDim}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Keperluan</Text>
              <View style={styles.radioGroup}>
                {KEPERLUAN_OPTIONS.map((opt, idx) => {
                  const selected = keperluan === opt;
                  return (
                    <Pressable
                      key={opt}
                      style={[
                        styles.radioRow,
                        idx > 0 && styles.radioRowDivider,
                        selected && styles.radioRowSelected,
                      ]}
                      onPress={() => setKeperluan(opt)}
                      hitSlop={4}
                    >
                      <View style={[styles.radio, selected && styles.radioSelected]}>
                        {selected ? <View style={styles.radioDot} /> : null}
                      </View>
                      <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {keperluan === "Lainnya" ? (
                <TextInput
                  style={[styles.input, styles.otherInput]}
                  value={keperluanOther}
                  onChangeText={setKeperluanOther}
                  autoCorrect={false}
                  placeholder="Renang, Les, dll"
                  placeholderTextColor={colors.inkDim}
                  autoFocus
                />
              ) : null}
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: 16 }}>
        <SafeAreaView style={styles.fabBar} edges={["bottom", "left", "right"]}>
          <Pressable
            style={[styles.cta, !canSave && styles.ctaDisabled]}
            disabled={!canSave}
            onPress={onSave}
          >
            <Text style={[styles.ctaText, !canSave && styles.ctaTextDisabled]}>
              {saving ? "Menyimpan…" : "Simpan Kunjungan"}
            </Text>
          </Pressable>
        </SafeAreaView>
      </KeyboardStickyView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  layout: {
    gap: 20,
  },
  layoutTablet: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 24,
    alignSelf: "center",
    width: "100%",
    maxWidth: 960,
  },
  column: {
    gap: 10,
  },
  columnLeft: {
    flex: 1,
  },
  columnRight: {
    flex: 1,
  },
  brandKey: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.inkMuted,
    letterSpacing: 1.4,
  },
  title: {
    fontFamily: fonts.sans,
    fontSize: 28,
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  photoCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.base,
    overflow: "hidden",
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  photo: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: colors.rule,
  },
  photoMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  metaKey: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.inkMuted,
    letterSpacing: 1.2,
  },
  metaAction: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.inkMuted,
    letterSpacing: 1.2,
  },
  input: {
    textTransform: "uppercase",
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.base,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  otherInput: {
    marginTop: 8,
  },
  radioGroup: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.base,
    overflow: "hidden",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  radioRowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  radioRowSelected: {
    backgroundColor: "rgba(34,197,94,0.08)",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.ruleStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: colors.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  radioLabel: {
    fontSize: 15,
    color: colors.ink2,
  },
  radioLabelSelected: {
    color: colors.ink,
    fontWeight: "600",
  },
  fabBar: {
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  cta: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.base,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  ctaDisabled: {
    backgroundColor: colors.rule,
    borderColor: colors.ruleStrong,
  },
  ctaText: {
    color: colors.accentInk,
    fontSize: 16,
    fontWeight: "600",
  },
  ctaTextDisabled: {
    color: colors.inkMuted,
  },
  emptyBox: {
    flex: 1,
    padding: 16,
    paddingTop: 48,
    gap: 12,
  },
});
