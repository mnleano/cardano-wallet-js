import Cardano from 'cardano-wallet';

import { restoreWallet, signMessage, verfifyMessage } from '../wallet';

const DEFEAULT_MNEMONIC =
  'crowd captain hungry tray powder motor coast oppose month shed parent mystery torch resemble index';
const DEFAULT_PASSWORD = 'the-password';

describe('wallet.restoreWallet', () => {
  test('should work', async () => {
    const { address, privateKey, publicKey } = await restoreWallet(
      DEFEAULT_MNEMONIC,
      DEFAULT_PASSWORD,
      true,
    );
    expect(address).toHaveLength(59);
    expect(privateKey).toBeInstanceOf(Cardano.PrivateKey);
    expect(publicKey).toBeInstanceOf(Cardano.PublicKey);
  });
});

describe('signing message', () => {
  let privateKey: Cardano.PrivateKey;
  let publicKey: Cardano.PublicKey;
  beforeAll(async () => {
    ({ privateKey, publicKey } = await restoreWallet(
      DEFEAULT_MNEMONIC,
      DEFAULT_PASSWORD,
      true,
    ));
  });
  describe('wallet.signMessage', () => {
    test('should work', async () => {
      const sig = signMessage(privateKey, Buffer.from('Hello world!'));
      expect(sig).toBeTruthy();
    });
  });
  describe('wallet.verfifyMessage', () => {
    test('should work', async () => {
      const sig = signMessage(privateKey, Buffer.from('Hello world!'));
      expect(sig).toBeTruthy();

      const result = verfifyMessage(
        publicKey,
        Buffer.from('Hello world!'),
        sig,
      );
      expect(result).toBeTruthy();
    });
  });
});
