import { Coin as CoinT, Bip44AccountPrivate } from 'cardano-wallet';

import { getBindingsForEnvironment } from '../../../lib/bindings';
import { Cardano, ChainSettings, AddressType } from '../../../types';

const {
  Signature,
  Entropy,
  Bip44RootPrivateKey,
  PrivateKey,
  AccountIndex,
  AddressKeyIndex,
  BlockchainSettings,
  Bip44AccountPublic,
  PublicKey,
  DerivationScheme,
} = getBindingsForEnvironment();

const HARD_DERIVATION_START = 0x80000000;

function getRustChainSettings(chainSettings: ChainSettings) {
  if (chainSettings === ChainSettings.testnet) {
    throw new Error('The wasm bindings do not support the testnet');
  }

  const chainSettingsMapping = {
    [ChainSettings.mainnet]: BlockchainSettings.mainnet(),
  };

  const targetSetting = chainSettingsMapping[chainSettings];

  if (!targetSetting) {
    throw new Error('Chain settings unsupported');
  }

  return targetSetting;
}

export function convertCoinToLovelace(coin: CoinT): string {
  const ada = coin.ada();
  const lovelace = coin.lovelace();
  return String(ada * 1000000 + lovelace);
}

export const RustCardano: Cardano = {
  account: (mnemonic, passphrase = '', accountIndex = 0) => {
    const entropy = Entropy.from_english_mnemonics(mnemonic);
    const privateKey = Bip44RootPrivateKey.recover(entropy, passphrase);
    const bip44Account = privateKey.bip44_account(
      AccountIndex.new(accountIndex | HARD_DERIVATION_START),
    );
    return {
      privateParentKey: bip44Account.key().to_hex(),
      publicParentKey: bip44Account.public().key().to_hex(),
    };
  },
  address: (
    { publicParentKey, index, type, accountIndex },
    chainSettings = ChainSettings.mainnet,
  ) => {
    const pk = PublicKey.from_hex(publicParentKey);
    const bip44Account = Bip44AccountPublic.new(pk, DerivationScheme.v2());
    const rustChainSettings = getRustChainSettings(chainSettings);
    const pubKey = bip44Account
      .bip44_chain(type === AddressType.internal)
      .address_key(AddressKeyIndex.new(index));

    const address = pubKey.bootstrap_era_address(rustChainSettings);
    return {
      address: address.to_base58(),
      index,
      type,
      accountIndex,
    };
  },
  signMessage: ({ privateParentKey, addressType, signingIndex, message }) => {
    const pk = PrivateKey.from_hex(privateParentKey);
    const bip44PrivateKey = Bip44AccountPrivate.new(pk, DerivationScheme.v2());
    const privateKey = bip44PrivateKey
      .bip44_chain(addressType === AddressType.internal)
      .address_key(AddressKeyIndex.new(signingIndex));

    return {
      signature: privateKey.sign(Buffer.from(message)).to_hex(),
      publicKey: bip44PrivateKey
        .public()
        .bip44_chain(addressType === AddressType.internal)
        .address_key(AddressKeyIndex.new(signingIndex))
        .to_hex(),
    };
  },
  verifyMessage: ({ message, publicKey, signature }) => {
    const signatureInterface = Signature.from_hex(signature);
    const publicKeyInterface = PublicKey.from_hex(publicKey);
    return publicKeyInterface.verify(Buffer.from(message), signatureInterface);
  },
};
