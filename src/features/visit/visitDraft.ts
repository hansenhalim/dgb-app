export type Keperluan =
  | "Bertamu"
  | "Antar Jemput"
  | "Pengantaran barang"
  | "Lainnya";

export type VisitDraft = {
  uid: string;
  rfidKey: string;
  photoUri?: string;
  nik?: string;
  nama?: string;
  plat?: string;
  tujuan?: string;
  keperluan?: Keperluan;
  /** Free-text reason, required only when keperluan === "Lainnya". */
  keperluanOther?: string;
};

let current: VisitDraft | null = null;

export function startDraft(uid: string, rfidKey: string): VisitDraft {
  current = { uid, rfidKey };
  return current;
}

export function getDraft(): VisitDraft | null {
  return current;
}

export function updateDraft(patch: Partial<VisitDraft>): VisitDraft {
  if (!current) {
    throw new Error("No active visit draft.");
  }
  current = { ...current, ...patch };
  return current;
}

export function clearDraft(): void {
  current = null;
}
