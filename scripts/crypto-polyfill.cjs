// Vite 4 / Vitest call `getRandomValues` on the `node:crypto` module namespace,
// which only exists there since Node 17.4/18. On older Node (e.g. 16.14) we add
// it from WebCrypto. Loaded via `node --require` before the CLI entry runs;
// harmless on newer Node where the property already exists.
const nodeCrypto = require('node:crypto');

if (typeof nodeCrypto.getRandomValues !== 'function' && nodeCrypto.webcrypto) {
  try {
    nodeCrypto.getRandomValues = (arr) => nodeCrypto.webcrypto.getRandomValues(arr);
  } catch {
    /* module namespace not extensible; ignore */
  }
}

if (typeof globalThis.crypto === 'undefined' && nodeCrypto.webcrypto) {
  globalThis.crypto = nodeCrypto.webcrypto;
}
