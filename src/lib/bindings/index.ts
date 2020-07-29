import cardanoNodeBindings from 'cardano-wallet';

function isNode() {
  try {
    return !!process;
  } catch (e) {
    return false;
  }
}

export function getBindingsForEnvironment() {
  return isNode()
    ? cardanoNodeBindings
    : // eslint-disable-next-line @typescript-eslint/no-var-requires
      (require('cardano-wallet-browser') as typeof cardanoNodeBindings);
}
