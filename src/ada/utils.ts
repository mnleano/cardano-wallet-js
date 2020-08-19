import { RustCardano } from '../lib';
import { AddressType } from '../types/Wallet';

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
