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

module.exports = {
  updateUserRole,
  blockUser,
  getAllUsers,
  updateTrainerRole,
};

