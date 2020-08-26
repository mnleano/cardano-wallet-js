export interface CoinAmountGetter {
  getCoin: string;
}

export interface TxInOutBase {
  ctaAddress: string;
  ctaAmount: CoinAmountGetter;
}

export interface TxInOut extends TxInOutBase {
  ctaTxHash: string;
  ctaTxIndex: number;
}

export interface TxSummary {
  ctsId: string;
  ctsTxTimeIssued: string;
  ctsBlockTimeIssued: number;
  ctsBlockHeight: number;
  ctsBlockEpoch: number;
  ctsBlockSlot: number;
  ctsBlockHash: string;
  ctsRelayedBy: string | null;
  ctsTotalInput: CoinAmountGetter;
  ctsTotalOutput: CoinAmountGetter;
  ctsFees: CoinAmountGetter;
  ctsInputs: TxInOutBase[];
  ctsOutputs: TxInOutBase[];
  [key: string]: any;
}

export interface Tx {
  ctbId: string;
  ctbTimeIssued: number;
  ctbInputs: TxInOut[];
  ctbOutputs: TxInOut[];
  ctbInputSum: CoinAmountGetter;
  ctbOutputSum: CoinAmountGetter;
  ctbFees: CoinAmountGetter;
}

export interface AddressSummary {
  caAddress: string;
  caType: string;
  caChainTip: {
    ctBlockNo: number;
    ctSlotNo: number;
    ctBlockHash: string;
  };
  caTxNum: number;
  caBalance: CoinAmountGetter;
  caTotalInput: CoinAmountGetter;
  caTotalOutput: CoinAmountGetter;
  caTotalFee: CoinAmountGetter;
  caTxList: TxSummary[];
}
