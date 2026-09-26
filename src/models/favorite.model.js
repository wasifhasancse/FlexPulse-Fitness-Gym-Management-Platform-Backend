const { getFavoriteCollection } = require("../config/db");

const FavoriteModel = {
  findOne: async (query) => {
    return getFavoriteCollection().findOne(query);
  },

  find: async (query = {}) => {
    return getFavoriteCollection().find(query).toArray();
  },

  create: async (data) => {
    return getFavoriteCollection().insertOne(data);
  },

  delete: async (query) => {
    return getFavoriteCollection().deleteOne(query);
  },
};

module.exports = FavoriteModel;
