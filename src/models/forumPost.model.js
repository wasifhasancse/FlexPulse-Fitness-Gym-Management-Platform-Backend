const { getForumPostCollection } = require("../config/db");
const { toObjectId, isValidObjectId } = require("../utils/helpers");

const ForumPostModel = {
  find: async (query = {}, options = {}) => {
    let cursor = getForumPostCollection().find(query);
    if (options.sort) cursor = cursor.sort(options.sort);
    if (options.skip) cursor = cursor.skip(options.skip);
    if (options.limit) cursor = cursor.limit(options.limit);
    return cursor.toArray();
  },

  countDocuments: async (query = {}) => {
    return getForumPostCollection().countDocuments(query);
  },

  findById: async (id) => {
    if (!isValidObjectId(id)) return null;
    return getForumPostCollection().findOne({ _id: toObjectId(id) });
  },

  findByUserId: async (userId) => {
    return getForumPostCollection().find({ userId }).toArray();
  },

  create: async (data) => {
    return getForumPostCollection().insertOne(data);
  },

  deleteById: async (id) => {
    const filter = isValidObjectId(id) ? { _id: toObjectId(id) } : { _id: id };
    return getForumPostCollection().deleteOne(filter);
  },

  updateById: async (id, updateDoc, options = {}) => {
    const filter = isValidObjectId(id) ? { _id: toObjectId(id) } : { _id: id };
    return getForumPostCollection().updateOne(filter, updateDoc, options);
  },

  findFeatured: async (limit = 3) => {
    return getForumPostCollection()
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  },
};

module.exports = ForumPostModel;
