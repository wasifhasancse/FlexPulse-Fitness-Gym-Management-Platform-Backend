require("dotenv").config();
const { createRemoteJWKSet } = require("jose-cjs");

let JWKS = null;

const getJWKS = () => {
  if (!JWKS) {
    const clientUrl = process.env.NEXT_CLIENT_URL || "http://localhost:3000";
    JWKS = createRemoteJWKSet(new URL(`${clientUrl}/api/auth/jwks`));
  }
  return JWKS;
};

module.exports = {
  getJWKS,
};
