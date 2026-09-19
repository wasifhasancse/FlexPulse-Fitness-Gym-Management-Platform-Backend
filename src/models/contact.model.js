const { getDatabase } = require("../config/db");

const getContactCollection = () => getDatabase().collection("contactMessages");
const getTrialPassCollection = () => getDatabase().collection("trialPasses");

const ContactModel = {
  createMessage: async (data) => {
    return getContactCollection().insertOne({
      ...data,
      createdAt: new Date(),
    });
  },

  getAllMessages: async () => {
    return getContactCollection().find().sort({ createdAt: -1 }).toArray();
  },
};

module.exports = ContactModel;
