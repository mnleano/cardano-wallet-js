import { restoreWallet } from '../wallet';

const DEFEAULT_MNEMONIC =
  'crowd captain hungry tray powder motor coast oppose month shed parent mystery torch resemble index';
const DEFAULT_PASSWORD = 'the-password';

const DEFAULT_PRIVATE_KEY =
  '68406b767112d8a44a3ac87d756bb4f7b0446fd9796cf12b7b6e9525a099e35066d5b3377cda15e3d661c4f552792283149030998abc7ce5d407829597c47dd4ed48fc742bc4e6f9668c0309b821f262cc247725215992de6ac974d12b930689';
const DEFAULT_PUBLIC_KEY =
  '9c055cc1367ee7bb3e1256689c273e180d63c4954c5db14b3f0f37a511e99297ed48fc742bc4e6f9668c0309b821f262cc247725215992de6ac974d12b930689';

describe('wallet.restoreWallet', () => {
  test('should work', async () => {
    const { address, privateKey, publicKey } = await restoreWallet(
      DEFEAULT_MNEMONIC,
      DEFAULT_PASSWORD,
      true,
    );
    expect(address).toHaveLength(59);
    expect(privateKey).toBe(DEFAULT_PRIVATE_KEY);
    expect(publicKey).toBe(DEFAULT_PUBLIC_KEY);
  });
});
