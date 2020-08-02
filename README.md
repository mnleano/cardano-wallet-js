# cardano-wallet-js

Cardano Wallet in JavaScript.

## Installation

- Run: `npm install`
- Run: `npm run build`

## Documentation

### Ada Wallet

- #### Create

- #### Create Random

- #### Restore

- #### Get balance

- #### History

### Cardano

- #### Create/Restore wallet (parent account)

  ```ts
    const { privateParentKey, publicParentKey } = cardano.account(
      mnemonic,
      password,
      accountIndex,
    );
  ````

- #### Create wallet account (child account)

  ```ts
    const address = cardano.address({
      publicParentKey,
      index: 0,
      type: AddressType.external,
      accountIndex: 0
    })
  ````

  Check `AddressType` in [`src/types/Wallet/Address.ts`](src/types/Wallet/Address.ts)

- #### Signing message

  ```ts
    const { signature, publicKey } = cardano.signMessage({
      privateParentKey,
      index: 0,
      addressType: AddressType.external,
      accountIndex: 0
    })
  ````

- #### Verifying message

  ```ts
    const result:boolean = cardano.verifyMessage({
      publicKey,
      message,
      signature
    })
  ````
