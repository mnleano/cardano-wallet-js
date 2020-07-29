import { ChainSettings } from './ChainSettings';

import { AddressType, Address } from '../Wallet';

export interface Cardano {
  account: (
    mnemonic: string,
    passphrase: string,
    accountIndex: number,
  ) => { privateParentKey: string; publicParentKey: string };
  address: (
    args: {
      publicParentKey: string;
      index: number;
      type: AddressType;
      accountIndex: number;
    },
    chainSettings?: ChainSettings,
  ) => Address;
  signMessage: (args: {
    privateParentKey: string;
    addressType: AddressType;
    signingIndex: number;
    message: string;
  }) => { signature: string; publicKey: string };
  verifyMessage: (args: {
    publicKey: string;
    message: string;
    signature: string;
  }) => boolean;
}
