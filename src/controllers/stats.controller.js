const UserModel = require("../models/user.model");
const ClassModel = require("../models/class.model");
const BookingModel = require("../models/booking.model");

// get admin dashboard stats
const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalClasses, totalBookings] = await Promise.all([
      UserModel.countAll(),
      ClassModel.countDocuments(),
      BookingModel.countDocuments(),
    ]);
    res.json({ totalUsers, totalClasses, totalBookings });
  } catch (error) {
    next(error);
  }
};

// get trainer dashboard stats (total students enrolled)
const getTrainerStats = async (req, res, next) => {
  try {
    const { trainerId } = req.query;
    if (!trainerId) {
      return res.status(400).json({ message: "trainerId required" });
    }

    const trainerClasses = await ClassModel.findByTrainerId(trainerId);
    const classIds = trainerClasses.map((cls) => String(cls._id));

    const totalStudents = await BookingModel.countDocuments({
      classId: { $in: classIds },
    });

    res.json({ totalStudents, totalClasses: trainerClasses.length });
  } catch (error) {
    next(error);
  }
};

// get students for a specific class (trainer)
const getTrainerClassStudents = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const bookings = await BookingModel.find({ classId });
    const students = bookings.map((b) => ({
      name: b.userName,
      email: b.userEmail,
    }));
    res.json(students);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getTrainerStats,
  getTrainerClassStudents,
};
