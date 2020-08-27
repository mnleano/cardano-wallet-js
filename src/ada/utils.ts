import { RustCardano } from '../lib';
import { AddressType } from '../types/Wallet';
import { TxInOut } from '../api/types';

export const signMessage = (args: {
  privateParentKey: string;
  addressType: AddressType;
  signingIndex: number;
  message: string;
}) => RustCardano.signMessage(args);

export const verifyMessage = (args: {
  message: string;
  signature: string;
  publicKey: string;
}) => RustCardano.verifyMessage(args);

export const generateTxMap = (list: TxInOut[]): Record<string, TxInOut> =>
  list.reduce((prev, tx) => ({ ...prev, [tx.ctaAddress]: tx }), {});

export const findTx = (address: string, list: TxInOut[]) =>
  list.find((tx) => tx.ctaAddress === address);
