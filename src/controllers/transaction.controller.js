const TransactionModel = require("../models/transaction.model");
const BookingModel = require("../models/booking.model");
const SubscriptionModel = require("../models/subscription.model");
const ClassModel = require("../models/class.model");
const UserModel = require("../models/user.model");
const { ensureUserActive } = require("../middlewares/userCheck.middleware");
const { isValidObjectId } = require("../utils/helpers");

// create transaction
const createTransaction = async (req, res, next) => {
  try {
    const {
      userId,
      userEmail,
      userName,
      classId,
      className,
      sessionId,
      transactionId,
      amount,
    } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorize" });
    }
    if (user.status === "banned") {
      return res.status(403).json({ message: "Action restricted by Admin." });
    }

    const activeResult = await ensureUserActive({ userId }, res);
    if (!activeResult.ok) return;

    const transactionData = {
      userId,
      userEmail,
      userName,
      classId,
      className,
      sessionId,
      transactionId,
      amount,
      bookedAt: new Date(),
    };

    const existingTransaction = await TransactionModel.findExisting(
      userId,
      classId,
      sessionId,
    );
    if (existingTransaction) {
      return res.status(400).json({ message: "Transaction already exists" });
    }

    // update the booking count for the class
    if (isValidObjectId(classId)) {
      await ClassModel.incrementBookingCount(classId, 1);
    }

    const result = await TransactionModel.create(transactionData);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// get all transactions
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await TransactionModel.findAll();
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// get all transactions for admin (combined bookings and subscriptions)
const getAllTransactionsAdmin = async (req, res, next) => {
  try {
    const [bookings, subscriptions] = await Promise.all([
      BookingModel.find({}, { sort: { bookedAt: -1 } }),
      SubscriptionModel.findAll({ sort: { createdAt: -1 } }),
    ]);

    const normalizedBookings = bookings.map((item) => ({
      ...item,
      amount: Number(item.price) || 0,
      date: item.bookedAt || item.createdAt,
    }));

    const normalizedSubscriptions = subscriptions.map((item) => ({
      ...item,
      amount: Number(item.amount) || 0,
      date: item.createdAt,
      userEmail: item.userEmail || "N/A",
    }));

    const result = [...normalizedBookings, ...normalizedSubscriptions].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    res.send(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getAllTransactionsAdmin,
};
