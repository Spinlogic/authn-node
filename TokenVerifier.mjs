import jwt from "jsonwebtoken";

/**
 * 
 * @param {*} config Object with structure { issuer: "string", audiences: ["string"], getKey: "GetKey" } 
 * @returns resolves a payload object with structure 
 *        {
            iss: string;
            aud: string;
            sub: string;
            exp: number;
            iat: number;
          }
 */
const TokenVerifier =
  (config) =>
    async (token) =>
      await new Promise((resolve, reject) => {
        jwt.verify(
          token,
          (header, callback) => {
            config.getKey(header)
              .then((k) => {
                callback(null, k);
              })
              .catch((err) => {
                callback(err);
              });
          },
          {
            issuer: config.issuer,
            audience: config.audiences,
          },
          (err, payload) => {
            (err ? reject(err) : resolve(payload))
          }
        );
      });

export { TokenVerifier };