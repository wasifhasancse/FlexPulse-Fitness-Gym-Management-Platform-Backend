const { getTransactionCollection } = require("../config/db");

const TransactionModel = {
  findExisting: async (userId, classId, sessionId) => {
    return getTransactionCollection().findOne({ userId, classId, sessionId });
  },

  create: async (data) => {
    return getTransactionCollection().insertOne(data);
  },

  findAll: async () => {
    return getTransactionCollection().find().toArray();
  },
};

module.exports = TransactionModel;
