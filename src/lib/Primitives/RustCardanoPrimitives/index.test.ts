import { InMemoryKeyManager } from 'lib';

import { AddressType } from 'types/Wallet';
import { RustCardano } from './index';

describe('RustCardano', () => {
  describe('verifyMessage', () => {
    test('returns true when verifying a correct signature for a message', async () => {
      const message = 'foobar';
      const mnemonic =
        'height bubble drama century ask online stage camp point loyal hip awesome';
      const keyManager = InMemoryKeyManager(RustCardano, {
        mnemonic,
        password: 'securepassword',
      });
      const { signature, publicKey } = await keyManager.signMessage(
        AddressType.external,
        0,
        message,
      );

      const verification = RustCardano.verifyMessage({
        publicKey,
        message,
        signature,
      });

      expect(verification).toBe(true);
    });

    test('returns false when verifying an incorrect message for a valid signature', async () => {
      const message = 'foobar';
      const mnemonic =
        'height bubble drama century ask online stage camp point loyal hip awesome';
      const keyManager = InMemoryKeyManager(RustCardano, {
        mnemonic,
        password: 'securepassword',
      });
      const { signature, publicKey } = await keyManager.signMessage(
        AddressType.external,
        0,
        message,
      );

      const verification = RustCardano.verifyMessage({
        publicKey,
        message: 'a differnt message',
        signature,
      });

      expect(verification).toBe(false);
    });
  });
});
