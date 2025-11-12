export interface BanknoteDetails {
  denomination: string;
  currencySymbol: string;
  mainColor: string;
  centralMotif: string;
  backgroundPattern: string;
  symbols: string;
  edgeDetail: string;
  issuingAuthority: string;
  issuingLocation: string;
  issuingAuthorityFont: string;
  motto: string;
  mottoFont: string;
  watermark: string;
  microprinting: string;
  holographicElement: string;
  animatedHologram: boolean;
  width: string;
  height: string;
  serialNumber: string;
  banknoteSeries: string;
  uvInkElement: string;
  intaglioPrinting: string;
  printQuality: string;
  metallicGlintEffect: string;
  foilEffect: string;
}

export interface HistoryItem {
  id: string;
  details: BanknoteDetails;
  imageUrl: string;
}