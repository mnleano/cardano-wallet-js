import { validateMnemonic } from 'bip39';
import { KeyManager, InvalidMnemonic } from 'types/KeyManager';
import { Cardano } from 'types/Cardano';

export function InMemoryKeyManager(
  cardano: Cardano,
  {
    password,
    accountIndex,
    mnemonic,
  }: {
    password: string;
    accountIndex?: number;
    mnemonic: string;
  },
): KeyManager {
  if (!accountIndex) {
    accountIndex = 0;
  }

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
        privateParentKey: privateParentKey,
        addressType,
        signingIndex,
        message,
      }),
    publicParentKey: async () => publicParentKey,
  };
}
