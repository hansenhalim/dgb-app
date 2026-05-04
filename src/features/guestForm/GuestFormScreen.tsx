import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";
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
import { useTheme } from "@/theme/theme";
import { fonts, radius, type Colors } from "@/theme/tokens";

import { TujuanAutocomplete } from "./TujuanAutocomplete";
import {
  KEPERLUAN_OPTIONS,
  useGuestFormViewModel,
} from "./useGuestFormViewModel";

export default function GuestFormScreen() {
  const { photoUri: rawPhotoUri } = useLocalSearchParams<{
    uid: string;
    rfidKey: string;
    photoUri?: string;
  }>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 640;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const vm = useGuestFormViewModel(rawPhotoUri);

  const onSave = useCallback(async () => {
    const ok = await vm.save();
    if (ok) router.dismissAll();
  }, [vm]);

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
          {vm.photoUri ? (
            <View style={[styles.column, isTablet && styles.columnLeft]}>
              <View style={styles.photoCard}>
                <Image
                  source={{ uri: vm.photoUri }}
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
                style={[styles.input, vm.isProcessing && styles.inputDisabled]}
                value={vm.nik}
                onChangeText={vm.setNik}
                keyboardType="number-pad"
                maxLength={16}
                autoCorrect={false}
                placeholder={
                  vm.isProcessing ? "Memproses identitas…" : "1234567890123456"
                }
                placeholderTextColor={colors.inkDim}
                editable={!vm.isProcessing}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nama</Text>
              <TextInput
                style={[styles.input, vm.isProcessing && styles.inputDisabled]}
                value={vm.nama}
                onChangeText={vm.setNama}
                autoCorrect={false}
                placeholder={
                  vm.isProcessing ? "Memproses identitas…" : "JOHN DOE"
                }
                placeholderTextColor={colors.inkDim}
                editable={!vm.isProcessing}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>No. Plat</Text>
              <TextInput
                style={styles.input}
                value={vm.plat}
                onChangeText={vm.setPlat}
                keyboardType="visible-password"
                autoCorrect={false}
                placeholder="BE 1234 CD"
                placeholderTextColor={colors.inkDim}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Tujuan</Text>
              <TujuanAutocomplete
                value={vm.tujuan}
                onChange={vm.setTujuan}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Keperluan</Text>
              <View style={styles.radioGroup}>
                {KEPERLUAN_OPTIONS.map((opt, idx) => {
                  const selected = vm.keperluan === opt;
                  return (
                    <Pressable
                      key={opt}
                      style={[
                        styles.radioRow,
                        idx > 0 && styles.radioRowDivider,
                        selected && styles.radioRowSelected,
                      ]}
                      onPress={() => vm.setKeperluan(opt)}
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

              {vm.keperluan === "Lainnya" ? (
                <TextInput
                  style={[styles.input, styles.otherInput]}
                  value={vm.keperluanOther}
                  onChangeText={vm.setKeperluanOther}
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
            style={[styles.cta, !vm.canSave && styles.ctaDisabled]}
            disabled={!vm.canSave}
            onPress={onSave}
          >
            <Text style={[styles.ctaText, !vm.canSave && styles.ctaTextDisabled]}>
              {vm.saving ? "Menyimpan…" : "Simpan Kunjungan"}
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
  photoCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.base,
    overflow: "hidden",
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
  inputDisabled: {
    backgroundColor: colors.rule,
    color: colors.inkMuted,
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
});
