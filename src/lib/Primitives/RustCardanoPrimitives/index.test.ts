import { InMemoryKeyManager } from '../../../lib';
import { AddressType } from '../../../types';

import { RustCardano } from './index';

describe('RustCardano', () => {
  describe('verifyMessage', () => {
    test('returns true when verifying a correct signature for a message', async () => {
      const message = 'foobar';
      const mnemonic =
        'upper regular slight wall pulp program anxiety erupt level winter action umbrella venue fun alter';
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
        'upper regular slight wall pulp program anxiety erupt level winter action umbrella venue fun alter';
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
        message: 'a different message',
        signature,
      });

      expect(verification).toBe(false);
    });
  });
});
