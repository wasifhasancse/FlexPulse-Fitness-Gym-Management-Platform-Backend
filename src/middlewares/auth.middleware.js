const { jwtVerify } = require("jose-cjs");
const { getJWKS } = require("../config/jwt");

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ msg: "Unauthorize" });
  }
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Unauthorize" });
  }

  try {
    const JWKS = getJWKS();
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "Unauthorize" });
  }
};

// Verify member role middleware
const memberVerify = async (req, res, next) => {
  const user = req.user;
  if (user?.role !== "member") {
    return res.status(403).json({ msg: "Forbidden" });
  }
  next();
};

// Verify trainer role middleware
const trainerVerify = async (req, res, next) => {
  const user = req.user;
  if (user?.role !== "trainer") {
    return res.status(403).json({ msg: "Forbidden" });
  }
  next();
};

// Verify admin role middleware
const adminVerify = async (req, res, next) => {
  const user = req.user;
  if (user?.role !== "admin") {
    return res.status(403).json({ msg: "Forbidden" });
  }
  next();
};

// Verify admin or trainer role middleware
const adminOrTrainerVerify = async (req, res, next) => {
  const user = req.user;
  if (user?.role !== "admin" && user?.role !== "trainer") {
    return res.status(403).json({ msg: "Forbidden" });
  }
  next();
};

module.exports = {
  verifyToken,
  memberVerify,
  trainerVerify,
  adminVerify,
  adminOrTrainerVerify,
};
