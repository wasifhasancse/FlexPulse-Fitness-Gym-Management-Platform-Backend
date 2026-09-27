const BookingModel = require("../models/booking.model");
const ClassModel = require("../models/class.model");
const UserModel = require("../models/user.model");
const { ensureUserActive } = require("../middlewares/userCheck.middleware");
const { isValidObjectId } = require("../utils/helpers");

// add a new booking class
const bookClass = async (req, res, next) => {
  try {
    const activeResult = await ensureUserActive(
      { userId: req.body?.userId, email: req.body?.userEmail },
      res,
    );
    if (!activeResult.ok) return;

    const { userId, classId, ...otherDetails } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorize" });
    }
    if (user.status === "banned") {
      return res.status(403).json({ message: "Action restricted by Admin." });
    }
    if (!userId || !classId) {
      return res.status(400).json({ error: "Missing userId or classId" });
    }

    // Use updateOne with upsert to prevent duplicates securely
    const result = await BookingModel.upsertBooking(userId, classId, otherDetails);

    // result.upsertedCount will be 1 only if it's a completely new document
    if (result.upsertedCount === 1) {
      if (isValidObjectId(classId)) {
        await ClassModel.incrementBookingCount(classId, 1);
      }
      return res
        .status(200)
        .json({ message: "Booking created successfully", result });
    } else {
      // Already existed, return a success status so frontend doesn't crash
      return res.status(200).json({
        message: "Booking already exists, ignoring duplicate entry",
      });
    }
  } catch (error) {
    next(error);
  }
};

// get all bookings by user id
const getUserBookings = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const query = { userId };
    const result = await BookingModel.find(query);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// check if a user has booked a class
const checkBooking = async (req, res, next) => {
  try {
    const { userId, classId } = req.query;
    const existing = await BookingModel.findOne({
      userId,
      classId,
    });
    res.status(200).json({ isBooked: !!existing });
  } catch (error) {
    next(error);
  }
};

// update subscription / auto-renew status
const updateSubscriptionStatus = async (req, res, next) => {
  try {
    const { userId, classId, bookingId, autoRenew, subscriptionStatus } = req.body;
    const { ObjectId } = require("mongodb");

    let query = {};
    if (bookingId && isValidObjectId(bookingId)) {
      query._id = new ObjectId(bookingId);
    } else if (userId && classId) {
      query = { userId, classId };
    } else {
      return res.status(400).json({ error: "Missing identifier for booking" });
    }

    const update = {
      $set: {
        autoRenew: Boolean(autoRenew),
        subscriptionStatus: subscriptionStatus || (autoRenew ? "active" : "cancelled_at_period_end"),
        updatedAt: new Date(),
      },
    };

    const result = await BookingModel.updateOne(query, update);
    res.status(200).json({ message: "Subscription preference updated", result, autoRenew });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookClass,
  getUserBookings,
  checkBooking,
  updateSubscriptionStatus,
};
