import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useCallback, useEffect, useRef, useState } from "react";

import { useServices } from "@/config/container";
import { useDestinations } from "@/config/destinations";

export type Keperluan =
  | "Bertamu"
  | "Antar Jemput"
  | "Pengantaran barang"
  | "Lainnya";

export const KEPERLUAN_OPTIONS: Keperluan[] = [
  "Bertamu",
  "Antar Jemput",
  "Pengantaran barang",
  "Lainnya",
];

export type GuestFormViewModel = {
  photoUri: string | undefined;
  isProcessing: boolean;
  saving: boolean;
  nik: string;
  nama: string;
  plat: string;
  tujuan: string;
  keperluan: Keperluan | null;
  keperluanOther: string;
  setNik: (v: string) => void;
  setNama: (v: string) => void;
  setPlat: (v: string) => void;
  setTujuan: (v: string) => void;
  setKeperluan: (v: Keperluan) => void;
  setKeperluanOther: (v: string) => void;
  canSave: boolean;
  save: () => Promise<boolean>;
};

const formatPlate = (raw: string) =>
  raw
    .replace(/\s+/g, "")
    .toUpperCase()
    .replace(/([A-Z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Z])/g, "$1 $2");

const sanitizeNik = (raw: string) => raw.replace(/\D/g, "").slice(0, 16);

export function useGuestFormViewModel(
  rawPhotoUri: string | undefined,
): GuestFormViewModel {
  const { idExtractor } = useServices();
  const {
    destinations,
    loading: destinationsLoading,
    fetch: fetchDestinations,
  } = useDestinations();

  const [photoUri, setPhotoUri] = useState<string | undefined>(rawPhotoUri);
  const [isProcessing, setIsProcessing] = useState<boolean>(!!rawPhotoUri);
  const [nik, setNikRaw] = useState("");
  const [nama, setNama] = useState("");
  const [plat, setPlatRaw] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [keperluan, setKeperluan] = useState<Keperluan | null>(null);
  const [keperluanOther, setKeperluanOther] = useState("");
  const [saving, setSaving] = useState(false);

  const setNik = useCallback((v: string) => setNikRaw(sanitizeNik(v)), []);
  const setPlat = useCallback((v: string) => setPlatRaw(formatPlate(v)), []);

  const triedLazyFetchRef = useRef(false);
  useEffect(() => {
    if (triedLazyFetchRef.current) return;
    if (destinations || destinationsLoading) return;
    triedLazyFetchRef.current = true;
    fetchDestinations();
  }, [destinations, destinationsLoading, fetchDestinations]);

  useEffect(() => {
    if (!rawPhotoUri) return;
    let cancelled = false;
    setIsProcessing(true);
    (async () => {
      try {
        const rendered = await ImageManipulator.manipulate(rawPhotoUri)
          .rotate(90)
          .renderAsync();
        const saved = await rendered.saveAsync({
          format: SaveFormat.JPEG,
          compress: 0.9,
        });
        if (cancelled) return;
        setPhotoUri(saved.uri);

        const extracted = await idExtractor.extract(saved.uri);
        if (cancelled) return;
        const idNumber = extracted.nik ?? extracted.nomorSim;
        if (idNumber) setNikRaw(sanitizeNik(idNumber));
        if (extracted.nama) setNama(extracted.nama);
      } catch {
        // Allow manual entry on OCR failure.
      } finally {
        if (!cancelled) setIsProcessing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rawPhotoUri, idExtractor]);

  const keperluanComplete =
    keperluan !== null &&
    (keperluan !== "Lainnya" || keperluanOther.trim().length > 0);

  const tujuanValid =
    !!destinations && destinations.some((d) => d.name === tujuan);

  const canSave =
    !saving &&
    !isProcessing &&
    nik.trim().length > 0 &&
    nama.trim().length > 0 &&
    tujuanValid &&
    keperluanComplete;

  const save = useCallback(async (): Promise<boolean> => {
    if (!canSave || !keperluan) return false;
    setSaving(true);
    try {
      // TODO: submit to server once the register-visit endpoint is defined.
      return true;
    } finally {
      setSaving(false);
    }
  }, [canSave, keperluan]);

  return {
    photoUri,
    isProcessing,
    saving,
    nik,
    nama,
    plat,
    tujuan,
    keperluan,
    keperluanOther,
    setNik,
    setNama,
    setPlat,
    setTujuan,
    setKeperluan,
    setKeperluanOther,
    canSave,
    save,
  };
}
