const { getUserCollection } = require("../config/db");
const { toObjectId, isValidObjectId } = require("../utils/helpers");

const UserModel = {
  findById: async (id) => {
    if (!isValidObjectId(id)) return null;
    return getUserCollection().findOne({ _id: toObjectId(id) });
  },

  findByEmail: async (email) => {
    return getUserCollection().findOne({ email });
  },

  findAll: async () => {
    return getUserCollection().find().toArray();
  },

  findTrainers: async () => {
    return getUserCollection().find({ role: "trainer" }).toArray();
  },

  updateRole: async (id, role) => {
    const filter = isValidObjectId(id) ? { _id: toObjectId(id) } : { _id: id };
    return getUserCollection().updateOne(filter, { $set: { role } });
  },

  updateStatus: async (id, status) => {
    const filter = isValidObjectId(id) ? { _id: toObjectId(id) } : { _id: id };
    return getUserCollection().updateOne(filter, { $set: { status } });
  },

  updatePlan: async (id, plan) => {
    const filter = isValidObjectId(id) ? { _id: toObjectId(id) } : { _id: id };
    return getUserCollection().updateOne(filter, { $set: { plan } });
  },

  countAll: async () => {
    return getUserCollection().countDocuments();
  },
};

module.exports = UserModel;
