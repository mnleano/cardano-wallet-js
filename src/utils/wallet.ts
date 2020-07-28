import Cardano from 'cardano-wallet';

// to connect the wallet to mainnet
const settings = Cardano.BlockchainSettings.mainnet();

export const restoreWallet = (
  mnemonic: string,
  password: string,
  internal = false,
) => {
  try {
    // recover the entropy
    const entropy = Cardano.Entropy.from_english_mnemonics(mnemonic);
    // recover the wallet
    const wallet = Cardano.Bip44RootPrivateKey.recover(entropy, password);

    // create a wallet account
    const account = wallet.bip44_account(
      Cardano.AccountIndex.new(0 | 0x80000000),
    );
    const account_public = account.public();

    // create an address
    const chain_pub = account_public.bip44_chain(internal);
    const key_pub = chain_pub.address_key(Cardano.AddressKeyIndex.new(0));
    const address = key_pub.bootstrap_era_address(settings);

    return Promise.resolve({
      address: address.to_base58(),
      publicKey: key_pub,
      privateKey: wallet.key(),
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

export const signMessage = (privateKey: Cardano.PrivateKey, data: Uint8Array) =>
  privateKey.sign(data);

export const verfifyMessage = (
  publicKey: Cardano.PublicKey,
  data: Uint8Array,
  signature: Cardano.Signature,
) => publicKey.verify(data, signature);
