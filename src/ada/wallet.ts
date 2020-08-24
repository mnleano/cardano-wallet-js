import { generateMnemonic, validateMnemonic } from '../utils/mnemonic';
import { RustCardano } from '../lib/Primitives/RustCardanoPrimitives/index';
import builder from '../helpers/builder';
import { AddressType, FeeAlgorithm } from '../types';
import Transaction, {
  TransactionInput,
  TransactionOutput,
} from '../types/Transaction';

import cardanoExploreAPI from '../api';
import { UNDEFINED, INVALID_MNEMONIC } from './errors/index';

class AdaWallet {
  create(args: { mnemonic: string; password: string; accountIndex?: number }) {
    try {
      if (!args) {
        throw UNDEFINED;
      }

      const { mnemonic, password, accountIndex = 0 } = args;
      if (!validateMnemonic(mnemonic)) {
        throw INVALID_MNEMONIC;
      }
      const { privateParentKey, publicParentKey } = RustCardano.account(
        mnemonic,
        password,
        accountIndex,
      );
      const address = RustCardano.address({
        publicParentKey,
        accountIndex,
        index: 0,
        type: AddressType.external,
      });

      return Promise.resolve(
        builder.success({
          ...address,
          mnemonic,
          privateKey: privateParentKey,
          publicKey: publicParentKey,
        }),
      );
    } catch (error) {
      return Promise.reject(builder.error(error));
    }
  }

  async createRandom() {
    try {
      const mnemonic = await generateMnemonic();
      return this.create({ mnemonic, password: '', accountIndex: 0 });
    } catch (error) {
      return Promise.reject(builder.error(error));
    }
  }

  async restore(args: { mnemonic: string; password: string }) {
    try {
      if (!args) {
        throw UNDEFINED;
      }

      const { mnemonic, password } = args;
      if (!validateMnemonic(mnemonic)) {
        throw INVALID_MNEMONIC;
      }
      return this.create({ mnemonic, password, accountIndex: 0 });
    } catch (error) {
      return Promise.reject(builder.error(error));
    }
  }

  async getBalance(address: string) {
    try {
      const summary = await cardanoExploreAPI.addressesSummary(address);
      const {
        caBalance: { getCoin: balance },
      } = summary;
      return Promise.resolve(builder.success({ balance: String(balance) }));
    } catch (error) {
      return Promise.reject(builder.error(error));
    }
  }

  async history(address: string) {
    try {
      const summary = await cardanoExploreAPI.addressesSummary(address);
      const { caTxList } = summary;
      return Promise.resolve(builder.success(caTxList));
    } catch (error) {
      return Promise.reject(builder.error(error));
    }
  }

  createTransaction(
    inputs: TransactionInput[],
    outputs: TransactionOutput[],
    feeAlgorithm = FeeAlgorithm.default,
  ) {
    const transactionInstance = Transaction(
      RustCardano,
      inputs,
      outputs,
      feeAlgorithm,
    );
    // TODO send transaction
    return transactionInstance;
  }
}

export const adaWallet = new AdaWallet();
