import { AddressType } from '../Wallet';

export interface KeyManager {
  signMessage: (
    addressType: AddressType,
    signingIndex: number,
    message: string,
  ) => Promise<{ publicKey: string; signature: string }>;
  publicParentKey: () => Promise<string>;
}
