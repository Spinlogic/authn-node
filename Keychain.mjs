import jwksClient from "jwks-rsa";

/**
 * 
 * @param {*} config Object { issuer: "string", keychainTTL: 1800 }
 * @returns GetKey (from the origiunal Keychain.mjs) -> this is function that returns a promise
 */
const KeyChain = (config) => {
    const client = jwksClient({
      cache: true,
      cacheMaxAge: config.keychainTTL * 60 * 1000,
      jwksUri: `${config.issuer}/jwks`,
    });
    return async (header) =>
      await new Promise((resolve, reject) => {
        client.getSigningKey(header.kid || "unknown", function (err, key) {
          err ? reject(err) : resolve(key.getPublicKey());
        });
      });
  };
export { KeyChain };