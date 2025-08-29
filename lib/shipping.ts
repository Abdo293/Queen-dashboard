// lib/shipping.ts
export type GovKey =
  | "cairo"
  | "giza"
  | "alex"
  | "dakahlia"
  | "sharqia"
  | "gharbia"
  | "qalyubia"
  | "menoufia"
  | "beheira"
  | "ismailia"
  | "suez"
  | "port_said"
  | "damietta"
  | "fayoum"
  | "bani_suef"
  | "minya"
  | "assiut"
  | "sohag"
  | "qena"
  | "luxor"
  | "aswan"
  | "red_sea"
  | "matruh"
  | "north_sinai"
  | "south_sinai"
  | "kafr_el_sheikh";

export const GOVERNORATES: Record<
  GovKey,
  { ar: string; en: string; fee: number }
> = {
  cairo: { ar: "القاهرة", en: "Cairo", fee: 35 },
  giza: { ar: "الجيزة", en: "Giza", fee: 40 },
  alex: { ar: "الإسكندرية", en: "Alexandria", fee: 45 },
  dakahlia: { ar: "الدقهلية", en: "Dakahlia", fee: 50 },
  sharqia: { ar: "الشرقية", en: "Sharqia", fee: 50 },
  gharbia: { ar: "الغربية", en: "Gharbia", fee: 50 },
  qalyubia: { ar: "القليوبية", en: "Qalyubia", fee: 45 },
  menoufia: { ar: "المنوفية", en: "Menoufia", fee: 50 },
  beheira: { ar: "البحيرة", en: "Beheira", fee: 55 },
  ismailia: { ar: "الإسماعيلية", en: "Ismailia", fee: 55 },
  suez: { ar: "السويس", en: "Suez", fee: 55 },
  port_said: { ar: "بورسعيد", en: "Port Said", fee: 55 },
  damietta: { ar: "دمياط", en: "Damietta", fee: 55 },
  fayoum: { ar: "الفيوم", en: "Fayoum", fee: 55 },
  bani_suef: { ar: "بني سويف", en: "Beni Suef", fee: 55 },
  minya: { ar: "المنيا", en: "Minya", fee: 60 },
  assiut: { ar: "أسيوط", en: "Assiut", fee: 60 },
  sohag: { ar: "سوهاج", en: "Sohag", fee: 65 },
  qena: { ar: "قنا", en: "Qena", fee: 65 },
  luxor: { ar: "الأقصر", en: "Luxor", fee: 70 },
  aswan: { ar: "أسوان", en: "Aswan", fee: 75 },
  red_sea: { ar: "البحر الأحمر", en: "Red Sea", fee: 70 },
  matruh: { ar: "مطروح", en: "Matrouh", fee: 70 },
  north_sinai: { ar: "شمال سيناء", en: "North Sinai", fee: 75 },
  south_sinai: { ar: "جنوب سيناء", en: "South Sinai", fee: 75 },
  kafr_el_sheikh: { ar: "كفر الشيخ", en: "Kafr El-Sheikh", fee: 55 },
};

export const DEFAULT_CURRENCY = "EGP";
