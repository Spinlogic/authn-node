import Key from "node-rsa";
import { use, expect, should } from "chai";
import chaiaspromised from "chai-as-promised";
import { TokenVerifier } from "../TokenVerifier.mjs";
import jwt from "jsonwebtoken";

use(chaiaspromised);
should();

describe("Testing TokenVerifier", function() {
  this.timeout(0); // some test time out in my machine. Comment this if you have a powerful one :-)
  const key = new Key({ b: 2048 });
  const config = {
    issuer: "yourissuer.com",
    audiences: ["youraudiences.com"],
    getKey: async () => key.exportKey("pkcs1-public-pem")
  };
  const verifier = TokenVerifier( config );
  var count = 1;

  it(`${count++}. valid JWT`, async () => {
    const token = jwt.sign({ sub: "123" }, key.exportKey('pkcs1'), { algorithm: 'RS256', issuer: config.issuer, audience: config.audiences });
    return expect(verifier(token)).to.eventually.have.property("sub").that.is.equal('123');;
  });

  it(`${count++}. with null JWT`, async () => {
    return verifier(null).should.eventually.be.rejectedWith(jwt.JsonWebTokenError, "jwt must be provided");
  });

  it(`${count++}. with empty JWT`, async () => {
    return verifier("").should.be.rejectedWith(jwt.JsonWebTokenError, "jwt must be provided");
  });

  it(`${count++}. with malformed JWT (a)`, async () => {
    return verifier("a").should.be.rejectedWith(jwt.JsonWebTokenError, "jwt malformed");
  });

  it(`${count++}. with malformed JWT (a.b)`, async () => {
    return verifier("a.b").should.be.rejectedWith(jwt.JsonWebTokenError, "jwt malformed");
  });
  
  it(`${count++}. with invalid JWT (a.b.c)`, async () => {
    return verifier("a.b.c").should.be.rejectedWith(jwt.JsonWebTokenError, "invalid token");
  });

  /* 
    @TODO  
    it("with unsigned JWT", async () => {
    const token = jwt.sign({}, key.exportKey('pkcs1'), { algorithm: 'RS256', issuer: config.issuer, audience: config.audiences });
    await expect(verifier(token)).rejects.toEqual(
      new JsonWebTokenError("jwt signature is required")
    );
  }); */

  it(`${count++}. with JWT signed by unknown keypair`, async () => {
    const unknownKey = new Key({ b: 2048 });
    const token = jwt.sign({ sub: "123" }, unknownKey.exportKey('pkcs1'), { algorithm: 'RS256', issuer: config.issuer, audience: config.audiences });
    return expect(verifier(token)).to.eventually.be.rejectedWith(jwt.JsonWebTokenError, "invalid signature");
  });

  it(`${count++}. with JWT from different issuer`, async () => {
    const token = jwt.sign({ sub: "123" }, key.exportKey('pkcs1'), { algorithm: 'RS256', issuer: "https://evil.tech", audience: config.audiences });
    return expect(verifier(token)).to.eventually.be.rejectedWith(jwt.JsonWebTokenError, "jwt issuer invalid. expected: authn.yaluba.com");
  });

  it(`${count++}. with JWT for different audience`, async () => {
    const token = jwt.sign({ sub: "123" }, key.exportKey('pkcs1'), { algorithm: 'RS256', issuer: config.issuer, audience: ["https://evil.tech"] });
    return expect(verifier(token)).to.eventually.be.rejectedWith(jwt.JsonWebTokenError, "jwt audience invalid. expected: art.yaluba.com");
  });

  it(`${count++}. with expired JWT`, async () => {
    const token = jwt.sign({ sub: "123" }, key.exportKey('pkcs1'), { algorithm: 'RS256', issuer: config.issuer, audience: config.audiences, expiresIn: -1 });
    return expect(verifier(token)).to.eventually.be.rejectedWith(jwt.JsonWebTokenError, "jwt expired");
  });

  it(`${count++}. with tampered claims JWT`, async () => {
    const token = jwt.sign({ sub: "123" }, key.exportKey('pkcs1'), { algorithm: 'RS256', issuer: config.issuer, audience: config.audiences});
    const [header, payload, signature] = token.split(".");
    const claims = decodeSegment(payload);
    claims["sub"] = "456";
    const token2 = [header, encodeClaims(claims), signature].join(".");
    await expect(verifier(token2)).to.eventually.be.rejectedWith(jwt.JsonWebTokenError, "invalid token");
  });

});

const decodeSegment = (segment) => JSON.parse(Buffer.from(segment, "base64").toString("ascii"));
const encodeClaims = (claims) => Buffer.from(JSON.stringify(claims)).toString("base64");