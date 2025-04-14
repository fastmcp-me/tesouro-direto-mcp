// Type definitions for the Tesouro Direto API

export interface BdTxTp {
  cd: number;
}

export interface TrsrBondMkt {
  opngDtTm: string;
  clsgDtTm: string;
  qtnDtTm: string;
  stsCd: number;
  sts: string;
}

export interface FinIndxs {
  cd: number;
  nm: string;
}

export interface BusSegmt {
  cd: number;
  nm: string;
}

export interface TrsrBdType {
  cd: number;
  nm: string;
  ctdyRate: number | null;
  grPr: number | null;
}

export interface BizSts {
  cd: number | null;
  dtTm: string;
}

export interface TrsrBd {
  cd: number;
  nm: string;
  featrs: string;
  mtrtyDt: string;
  minInvstmtAmt: number;
  untrInvstmtVal: number;
  invstmtStbl: string;
  semiAnulIntrstInd: boolean;
  rcvgIncm: string;
  anulInvstmtRate: number;
  anulRedRate: number;
  minRedQty: number;
  untrRedVal: number;
  minRedVal: number;
  isinCd: string;
  FinIndxs: FinIndxs;
  wdwlDt: string | null;
  convDt: string | null;
  BusSegmt: BusSegmt | null;
  amortQuotQty: number;
}

export interface TrsrBdTradgListItem {
  TrsrBd: TrsrBd;
  TrsrBdType: TrsrBdType;
  SelicCode: number;
}

export interface ResponseData {
  BdTxTp: BdTxTp;
  TrsrBondMkt: TrsrBondMkt;
  TrsrBdTradgList: TrsrBdTradgListItem[];
  BizSts: BizSts;
}

export interface ApiResponse {
  responseStatus: number;
  responseStatusText: string;
  statusInfo: string;
  response: ResponseData;
}
