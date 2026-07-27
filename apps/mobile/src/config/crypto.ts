import * as Crypto from "expo-crypto";

if (typeof globalThis.crypto?.randomUUID !== "function") {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      ...globalThis.crypto,
      randomUUID: Crypto.randomUUID,
    },
  });
}
