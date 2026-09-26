const { getTrainerApplicationCollection } = require("../config/db");
const { toObjectId, isValidObjectId } = require("../utils/helpers");

const TrainerApplicationModel = {
  findByUserId: async (userId) => {
    return getTrainerApplicationCollection().findOne({ userId });
  },

  findById: async (id) => {
    if (!isValidObjectId(id)) return null;
    return getTrainerApplicationCollection().findOne({ _id: toObjectId(id) });
  },

  findAll: async (options = {}) => {
    let cursor = getTrainerApplicationCollection().find();
    if (options.sort) cursor = cursor.sort(options.sort);
    return cursor.toArray();
  },

  create: async (data) => {
    return getTrainerApplicationCollection().insertOne(data);
  },

  updateById: async (id, updateFields) => {
    const filter = isValidObjectId(id) ? { _id: toObjectId(id) } : { _id: id };
    return getTrainerApplicationCollection().updateOne(filter, { $set: updateFields });
  },

  deleteById: async (id) => {
    const filter = isValidObjectId(id) ? { _id: toObjectId(id) } : { _id: id };
    return getTrainerApplicationCollection().deleteOne(filter);
  },

  demoteByUserId: async (userId) => {
    return getTrainerApplicationCollection().updateMany(
      { userId },
      { $set: { status: "demoted", reviewedAt: new Date() } },
    );
  },
};

module.exports = TrainerApplicationModel;
