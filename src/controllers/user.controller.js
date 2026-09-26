const UserModel = require("../models/user.model");
const TrainerApplicationModel = require("../models/trainerApplication.model");

// update user role for admin dashboard
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userRole } = req.body;
    const result = await UserModel.updateRole(id, userRole);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// block user by admin dashboard
const blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(id, status);
    const result = await UserModel.updateStatus(id, status);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// get all users
const getAllUsers = async (req, res, next) => {
  try {
    const result = await UserModel.findAll();
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// update user role (used for trainer demotion)
const updateTrainerRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const result = await UserModel.updateRole(userId, role);

    if (role === "member") {
      await TrainerApplicationModel.demoteByUserId(userId);
    }

    res.send(result);
  } catch (error) {
    next(error);
  }
};

const ClassModel = require("../models/class.model");

// get public trainers with their profile info and classes
const getPublicTrainers = async (req, res, next) => {
  try {
    const trainers = await UserModel.findTrainers();
    const trainerApplications = await TrainerApplicationModel.findAll();
    const classes = await ClassModel.find({ status: "approved" });

    const enrichedTrainers = trainers.map((trainer) => {
      const app = trainerApplications.find(
        (a) => String(a.userId) === String(trainer._id) || a.userEmail === trainer.email,
      );
      const trainerClasses = classes.filter(
        (c) => String(c.authorId) === String(trainer._id) || c.authorEmail === trainer.email,
      );

      return {
        _id: trainer._id,
        name: trainer.name || app?.userName || "FlexPulse Coach",
        email: trainer.email,
        image: trainer.image || null,
        role: trainer.role,
        bio: app?.bio || "Certified elite fitness coach dedicated to helping members achieve peak athletic performance and strength.",
        specialty: app?.specialty || (trainerClasses[0]?.category || "General Strength & Conditioning"),
        experience: app?.experience || "4+",
        classesCount: trainerClasses.length,
        classes: trainerClasses.map((cls) => ({
          _id: cls._id,
          className: cls.className,
          category: cls.category,
          price: cls.price,
          image: cls.image,
        })),
      };
    });

    res.json(enrichedTrainers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateUserRole,
  blockUser,
  getAllUsers,
  updateTrainerRole,
  getPublicTrainers,
};
