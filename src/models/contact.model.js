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

  createTrialPass: async (data) => {
    const passCode = FP-${Math.random().toString(36).substring(2, 8).toUpperCase()};
    const newPass = {
      ...data,
      passCode,
      status: "active",
      createdAt: new Date(),
    };
    const result = await getTrialPassCollection().insertOne(newPass);
    return { ...result, passCode };
  },

  findPassByEmail: async (email) => {
    return getTrialPassCollection().findOne({ email });
  },
};

module.exports = ContactModel;
