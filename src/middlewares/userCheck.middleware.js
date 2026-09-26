const { getUserCollection } = require("../config/db");
const { toObjectId, isValidObjectId, normalizeStatus } = require("../utils/helpers");

const getUserByIdOrEmail = async ({ userId, email }) => {
  const userCollection = getUserCollection();
  if (userId && isValidObjectId(userId)) {
    return userCollection.findOne({ _id: toObjectId(userId) });
  }
  if (email) {
    return userCollection.findOne({ email });
  }
  return null;
};

const ensureUserActive = async ({ userId, email }, res) => {
  const user = await getUserByIdOrEmail({ userId, email });
  if (!user) {
    res.status(401).json({ message: "Unauthorize" });
    return { ok: false };
  }

  if (normalizeStatus(user.status) === "banned") {
    res.status(403).json({ message: "Action restricted by Admin" });
    return { ok: false };
  }

  return { ok: true, user };
};

module.exports = {
  getUserByIdOrEmail,
  ensureUserActive,
};
