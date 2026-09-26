const { getClassCollection } = require("../config/db");
const { toObjectId, isValidObjectId } = require("../utils/helpers");

const ClassModel = {
  find: async (query = {}, options = {}) => {
    let cursor = getClassCollection().find(query);
    if (options.sort) cursor = cursor.sort(options.sort);
    if (options.skip) cursor = cursor.skip(options.skip);
    if (options.limit) cursor = cursor.limit(options.limit);
    return cursor.toArray();
  },

  countDocuments: async (query = {}) => {
    return getClassCollection().countDocuments(query);
  },

  findById: async (id) => {
    if (!isValidObjectId(id)) return null;
    return getClassCollection().findOne({ _id: toObjectId(id) });
  },

  findByTrainerId: async (trainerId) => {
    return getClassCollection().find({ authorId: trainerId }).toArray();
  },

  create: async (data) => {
    return getClassCollection().insertOne(data);
  },

  updateById: async (id, updateFields) => {
    const filter = isValidObjectId(id) ? { _id: toObjectId(id) } : { _id: id };
    return getClassCollection().updateOne(filter, { $set: updateFields });
  },

  incrementBookingCount: async (id, count = 1) => {
    const filter = isValidObjectId(id) ? { _id: toObjectId(id) } : { _id: id };
    return getClassCollection().updateOne(filter, { $inc: { bookingCount: count } });
  },

  deleteById: async (id) => {
    const filter = isValidObjectId(id) ? { _id: toObjectId(id) } : { _id: id };
    return getClassCollection().deleteOne(filter);
  },

  findFeatured: async (limit = 6) => {
    return getClassCollection()
      .find({ status: "approved" })
      .sort({ bookingCount: -1 })
      .limit(limit)
      .toArray();
  },
};

module.exports = ClassModel;
