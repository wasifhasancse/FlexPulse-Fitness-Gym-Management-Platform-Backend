const ClassModel = require("../models/class.model");
const BookingModel = require("../models/booking.model");
const { ensureUserActive } = require("../middlewares/userCheck.middleware");
const { normalizeStatus } = require("../utils/helpers");

// get all classes and filter by search and category
const getAllClasses = async (req, res, next) => {
  try {
    const {
      search = "",
      category = "",
      page,
      limit,
      includeAll,
    } = req.query;
    const query = {};

    if (includeAll !== "true") {
      query.status = "approved";
    }

    if (search) query.className = { $regex: search, $options: "i" };

    if (category && category !== "All Categories") {
      const categories = category
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      if (categories.length > 0) {
        query.category = { $in: categories };
      }
    }

    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 0;

    if (parsedLimit > 0) {
      const skip = (parsedPage - 1) * parsedLimit;
      const [items, total] = await Promise.all([
        ClassModel.find(query, {
          sort: { createdAt: -1 },
          skip,
          limit: parsedLimit,
        }),
        ClassModel.countDocuments(query),
      ]);

      return res.send({
        items,
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1,
      });
    }

    const result = await ClassModel.find(query, { sort: { createdAt: -1 } });
    return res.send(result);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send({ message: error.message });
  }
};

// get a single class by class id
const getClassById = async (req, res, next) => {
  try {
    const result = await ClassModel.findById(req.params.id);
    res.send(result || {});
  } catch (error) {
    next(error);
  }
};

// get class booking count
const getClassBookingCount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookingCount = await BookingModel.countDocuments({ classId: id });
    res.send({ bookingCount: bookingCount || 0 });
  } catch (error) {
    next(error);
  }
};

// get a single trainer's classes by trainer id
const getMyClasses = async (req, res, next) => {
  try {
    const { trainerId } = req.query;
    const query = { authorId: trainerId };
    const result = await ClassModel.find(query);
    res.send(result || []);
  } catch (error) {
    next(error);
  }
};

// add a new class
const addClass = async (req, res, next) => {
  try {
    const activeResult = await ensureUserActive(
      { userId: req.body?.authorId, email: req.body?.authorEmail },
      res,
    );
    if (!activeResult.ok) return;

    const data = req.body;
    const newData = {
      ...data,
      createdAt: new Date(),
      bookingCount: 0,
      status: data?.status || "pending",
    };
    const result = await ClassModel.create(newData);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// update a class by class id
const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const result = await ClassModel.updateById(id, updatedData);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// delete a class by class id
const deleteMyClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log("Deleting class with ID:", id);
    const result = await ClassModel.deleteById(id);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// get all class records for admin dashboard moderation
const getAllClassesByAdmin = async (req, res, next) => {
  try {
    const result = await ClassModel.find({}, { sort: { createdAt: -1 } });
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// approve / reject class by admin
const updateClassStatusByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await ClassModel.updateById(id, {
      status: normalizeStatus(status),
      updatedAt: new Date(),
    });
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// delete class by admin
const deleteClassByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ClassModel.deleteById(id);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// get featured classes (most booked)
const getFeaturedClasses = async (req, res, next) => {
  try {
    const classes = await ClassModel.findFeatured(6);
    res.send(classes);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  getClassBookingCount,
  getMyClasses,
  addClass,
  updateClass,
  deleteMyClass,
  getAllClassesByAdmin,
  updateClassStatusByAdmin,
  deleteClassByAdmin,
  getFeaturedClasses,
};
