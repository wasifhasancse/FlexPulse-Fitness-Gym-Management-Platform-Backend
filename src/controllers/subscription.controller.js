const SubscriptionModel = require("../models/subscription.model");
const UserModel = require("../models/user.model");
const { ensureUserActive } = require("../middlewares/userCheck.middleware");

// add a new subscription
const createSubscription = async (req, res, next) => {
  try {
    const { sessionId, userId, priceId } = req.body;

    const activeResult = await ensureUserActive({ userId }, res);
    if (!activeResult.ok) return;

    const isExist = await SubscriptionModel.findBySessionId(sessionId);
    if (isExist) {
      return res.json({ msg: "Subscription already exists!" });
    }

    await SubscriptionModel.create({ sessionId, userId, priceId });
    await UserModel.updatePlan(userId, "pro");

    res.json({ msg: "Subscription added successfully!" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubscription,
};
