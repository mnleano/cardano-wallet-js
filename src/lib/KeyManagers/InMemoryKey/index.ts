import { validateMnemonic } from 'bip39';
import { KeyManager, InvalidMnemonic, Cardano } from '../../../types';

export function InMemoryKeyManager(
  cardano: Cardano,
  {
    mnemonic,
    password,
    accountIndex = 0,
  }: {
    mnemonic: string;
    password: string;
    accountIndex?: number;
  },
): KeyManager {
  const validMnemonic = validateMnemonic(mnemonic);
  if (!validMnemonic) throw new InvalidMnemonic();

  const { privateParentKey, publicParentKey } = cardano.account(
    mnemonic,
    password,
    accountIndex,
  );

  return {
    signMessage: async (addressType, signingIndex, message) =>
      cardano.signMessage({
        privateParentKey,
        addressType,
        signingIndex,
        message,
      }),
    publicParentKey: async () => publicParentKey,
  };
}
