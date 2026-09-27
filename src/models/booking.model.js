const { getBookingCollection } = require("../config/db");

const BookingModel = {
  find: async (query = {}, options = {}) => {
    let cursor = getBookingCollection().find(query);
    if (options.sort) cursor = cursor.sort(options.sort);
    if (options.skip) cursor = cursor.skip(options.skip);
    if (options.limit) cursor = cursor.limit(options.limit);
    return cursor.toArray();
  },

  findOne: async (query) => {
    return getBookingCollection().findOne(query);
  },

  upsertBooking: async (userId, classId, bookingData) => {
    return getBookingCollection().updateOne(
      { userId, classId },
      {
        $setOnInsert: {
          userId,
          classId,
          ...bookingData,
          bookedAt: new Date(),
        },
      },
      { upsert: true },
    );
  },

  countDocuments: async (query = {}) => {
    return getBookingCollection().countDocuments(query);
  },

  updateOne: async (query, updateData) => {
    return getBookingCollection().updateOne(query, updateData);
  },
};

module.exports = BookingModel;
