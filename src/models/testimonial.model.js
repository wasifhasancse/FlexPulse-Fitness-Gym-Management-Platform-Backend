const { getTestimonialCollection } = require("../config/db");
const { toObjectId, isValidObjectId } = require("../utils/helpers");

const TestimonialModel = {
  find: async (query = {}, options = {}) => {
    let cursor = getTestimonialCollection().find(query);
    if (options.sort) cursor = cursor.sort(options.sort);
    if (options.skip) cursor = cursor.skip(options.skip);
    if (options.limit) cursor = cursor.limit(options.limit);
    return cursor.toArray();
  },

  countDocuments: async (query = {}) => {
    return getTestimonialCollection().countDocuments(query);
  },

  findById: async (id) => {
    if (!isValidObjectId(id)) return null;
    return getTestimonialCollection().findOne({ _id: toObjectId(id) });
  },

  findByUserId: async (userId) => {
    return getTestimonialCollection().find({ userId }).sort({ createdAt: -1 }).toArray();
  },

  create: async (data) => {
    return getTestimonialCollection().insertOne(data);
  },

  deleteById: async (id) => {
    const filter = isValidObjectId(id) ? { _id: toObjectId(id) } : { _id: id };
    return getTestimonialCollection().deleteOne(filter);
  },

  updateById: async (id, updateDoc, options = {}) => {
    const filter = isValidObjectId(id) ? { _id: toObjectId(id) } : { _id: id };
    return getTestimonialCollection().updateOne(filter, updateDoc, options);
  },
};

module.exports = TestimonialModel;
