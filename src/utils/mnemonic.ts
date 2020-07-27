import {
  generateMnemonic as _generateMnemonic,
  validateMnemonic as _validateMnemonic,
  wordlists,
} from 'bip39';

export const generateMnemonic = (wordCount = 15) => {
  try {
    if (wordCount % 3 !== 0) {
      throw Error(`Invalid mnemonic word count supplied: ${wordCount}`);
    }
    const mnemonic = _generateMnemonic(
      (32 * wordCount) / 3,
      undefined,
      wordlists.EN,
    );
    return Promise.resolve(mnemonic);
  } catch (error) {
    return Promise.reject(error);
  }
};

function mnemonicToList(mnemonic: string) {
  return mnemonic.split(' ');
}

function validateMnemonicWords(mnemonic: string) {
  const wordlist = wordlists.EN;
  const words = mnemonic.split(' ');

  return words.every((word) => wordlist.indexOf(word) !== -1);
}

export const isMnemonicInPaperWalletFormat = (mnemonic: string) =>
  mnemonicToList(mnemonic).length === 27;

export const validatePaperWalletMnemonic = (mnemonic: string) =>
  !!mnemonic &&
  validateMnemonicWords(mnemonic) &&
  isMnemonicInPaperWalletFormat(mnemonic);

export const validateMnemonic = (mnemonic: string) => {
  try {
    return (
      !!mnemonic &&
      (_validateMnemonic(mnemonic) || validatePaperWalletMnemonic(mnemonic))
    );
  } catch (e) {
    return false;
  }
};
