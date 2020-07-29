import {
  PublicKey,
  BlockchainSettings,
  Entropy,
  Bip44RootPrivateKey,
  AccountIndex,
  AddressKeyIndex,
  PrivateKey,
  Signature,
} from 'cardano-wallet';

// to connect the wallet to mainnet
const settings = BlockchainSettings.mainnet();

export const restoreWallet = (
  mnemonic: string,
  password: string,
  internal = false,
) => {
  try {
    // recover the entropy
    const entropy = Entropy.from_english_mnemonics(mnemonic);
    // recover the wallet
    const wallet = Bip44RootPrivateKey.recover(entropy, password);

    // create a wallet account
    const account = wallet.bip44_account(AccountIndex.new(0 | 0x80000000));
    const account_public = account.public();

    // create an address
    const chain_pub = account_public.bip44_chain(internal);
    const key_pub = chain_pub.address_key(AddressKeyIndex.new(0));
    const address = key_pub.bootstrap_era_address(settings);

    return Promise.resolve({
      address: address.to_base58(),
      publicKey: account_public.key().to_hex(),
      privateKey: account.key().to_hex(),
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

export const signMessage = (privateKey: string, data: Uint8Array) =>
  PrivateKey.from_hex(privateKey).sign(data).to_hex();

export const verfifyMessage = (
  publicKey: string,
  data: Uint8Array,
  signature: string,
) => PublicKey.from_hex(publicKey).verify(data, Signature.from_hex(signature));
