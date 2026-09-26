const { getSubscriptionCollection } = require("../config/db");

const SubscriptionModel = {
  findBySessionId: async (sessionId) => {
    return getSubscriptionCollection().findOne({ sessionId });
  },

  create: async (data) => {
    return getSubscriptionCollection().insertOne(data);
  },

  findAll: async (options = {}) => {
    let cursor = getSubscriptionCollection().find();
    if (options.sort) cursor = cursor.sort(options.sort);
    return cursor.toArray();
  },
};

module.exports = SubscriptionModel;
