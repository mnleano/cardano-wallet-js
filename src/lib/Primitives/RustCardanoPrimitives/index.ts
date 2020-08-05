import { Coin as CoinT, Bip44AccountPrivate } from 'cardano-wallet';

import { getBindingsForEnvironment } from '../../../lib/bindings';
import {
  Cardano,
  ChainSettings,
  AddressType,
  FeeAlgorithm,
} from '../../../types';
import { InsufficientTransactionInput } from '../../../types/Transaction/errors';

const {
  AccountIndex,
  AddressKeyIndex,
  Bip44AccountPublic,
  Bip44RootPrivateKey,
  BlockchainSettings,
  Coin,
  DerivationScheme,
  Entropy,
  LinearFeeAlgorithm,
  PrivateKey,
  PublicKey,
  Signature,
  Transaction,
  TransactionBuilder,
  TransactionFinalized,
  TransactionSignature,
  TxoPointer,
  TxOut,
  Witness,
} = getBindingsForEnvironment();

const HARD_DERIVATION_START = 0x80000000;

function getRustFeeAlgorithm(algo: FeeAlgorithm) {
  const feeAlgoMapping = {
    [FeeAlgorithm.default]: LinearFeeAlgorithm.default(),
  };

  const targetAlgo = feeAlgoMapping[algo];

  if (!targetAlgo) {
    throw new Error('Fee algorithm unsupported');
  }

  return targetAlgo;
}

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

  buildTransaction: (inputs, outputs, feeAlgorithm = FeeAlgorithm.default) => {
    const transactionBuilder = new TransactionBuilder();

    inputs.forEach((input) => {
      const pointer = TxoPointer.from_json(input.pointer);
      const value = Coin.from(0, Number(input.value.value));
      transactionBuilder.add_input(pointer, value);
    });

    outputs.forEach((output) => {
      const txOut = TxOut.from_json(output);
      transactionBuilder.add_output(txOut);
    });

    const rustFeeAlgo = getRustFeeAlgorithm(feeAlgorithm);
    const balance = transactionBuilder.get_balance(rustFeeAlgo);
    if (balance.is_negative()) throw new InsufficientTransactionInput();

    /*
      The get_balance_without_fees from the WASM bindings returns:

      Σ(transactionInputValues) - Σ(transactionOutputValues)

      This represents the fee paid on a transaction, as the positive balance
      between inputs and the associated outputs is equal to the fee paid
    */
    const feeAsCoinType = transactionBuilder.get_balance_without_fees().value();
    const fee = convertCoinToLovelace(feeAsCoinType);

    /*
      It can be useful to use the Transaction builder to estimate the
      fee of a transaction before exact inputs are allocate for desired
      outputs. The WASM bindings have the ability to do this
    */
    const feeEstimate = transactionBuilder.estimate_fee(rustFeeAlgo);
    const feeEstimateAsLovelace = convertCoinToLovelace(feeEstimate);

    const cardanoTransaction = transactionBuilder.make_transaction();

    // This gets around WASM incorrectly freeing the tx allocation when
    // we want reference to a finalizer
    const txClone = Transaction.from_json(cardanoTransaction.to_json());
    const finalizer = new TransactionFinalized(cardanoTransaction);

    return {
      toHex: () => txClone.to_hex(),
      toJson: () => txClone.to_json(),
      id: () => txClone.id().to_hex(),
      addWitness: ({ privateParentKey, addressing, chainSettings }) => {
        if (!chainSettings) {
          chainSettings = ChainSettings.mainnet;
        }

        const rustChainSettings = getRustChainSettings(chainSettings);

        const privateKey = PrivateKey.from_hex(privateParentKey);
        const privateKeyBip44 = Bip44RootPrivateKey.new(
          privateKey,
          DerivationScheme.v2(),
        )
          .bip44_account(
            AccountIndex.new(addressing.accountIndex | HARD_DERIVATION_START),
          )
          .bip44_chain(addressing.change === 1)
          .address_key(AddressKeyIndex.new(addressing.index));

        const witness = Witness.new_extended_key(
          rustChainSettings,
          privateKeyBip44,
          txClone.id(),
        );
        finalizer.add_witness(witness);
      },
      addExternalWitness: ({
        publicParentKey,
        witnessIndex,
        witnessHex,
        addressType,
      }) => {
        const publicKey = PublicKey.from_hex(publicParentKey);
        const publicKeyBip44 = Bip44AccountPublic.new(
          publicKey,
          DerivationScheme.v2(),
        )
          .bip44_chain(addressType === AddressType.internal)
          .address_key(AddressKeyIndex.new(witnessIndex));

        const txSignature = TransactionSignature.from_hex(witnessHex);

        const witness = Witness.from_external(publicKeyBip44, txSignature);
        finalizer.add_witness(witness);
      },
      finalize: () => finalizer.finalize().to_hex(),
      fee: () => fee,
      estimateFee: () => feeEstimateAsLovelace,
    };
  },
};
