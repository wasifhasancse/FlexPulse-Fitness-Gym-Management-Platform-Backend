const TrainerApplicationModel = require("../models/trainerApplication.model");
const UserModel = require("../models/user.model");
const { ensureUserActive } = require("../middlewares/userCheck.middleware");
const { isValidObjectId } = require("../utils/helpers");

// add a new trainer application
const applyTrainer = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorize" });
    }
    if (user.status === "banned") {
      return res.status(403).json({ message: "Action restricted by Admin." });
    }

    const activeResult = await ensureUserActive({ userId }, res);
    if (!activeResult.ok) return;

    const existing = await TrainerApplicationModel.findByUserId(userId);
    if (existing) {
      return res.status(400).json({ error: "Already applied!" });
    }

    const result = await TrainerApplicationModel.create(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// get a trainer application by user id
const getTrainerApplicationByUser = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        message: "Missing userId in query parameters",
      });
    }
    const result = await TrainerApplicationModel.findByUserId(userId);
    res.json(result || {});
  } catch (error) {
    next(error);
  }
};

// check if a user has applied for trainer application
const checkTrainerApplication = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const existing = await TrainerApplicationModel.findByUserId(userId);
    res.json({ hasApplied: !!existing, status: existing?.status || null });
  } catch (error) {
    next(error);
  }
};

// get all trainer applications for admin
const getAllTrainerApplicationsAdmin = async (req, res, next) => {
  try {
    const result = await TrainerApplicationModel.findAll({
      sort: { appliedAt: -1 },
    });
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// approve a trainer application
const approveTrainerApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { feedback = "" } = req.body;

    const application = await TrainerApplicationModel.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    await TrainerApplicationModel.updateById(id, {
      status: "approved",
      feedback,
      reviewedAt: new Date(),
    });

    if (isValidObjectId(application.userId)) {
      await UserModel.updateRole(application.userId, "trainer");
    }

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// reject a trainer application
const rejectTrainerApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { feedback = "" } = req.body;

    await TrainerApplicationModel.updateById(id, {
      status: "rejected",
      feedback,
      reviewedAt: new Date(),
    });

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// delete trainer application
const deleteTrainerApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await TrainerApplicationModel.deleteById(id);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// get all trainers for admin
const getAllTrainersAdmin = async (req, res, next) => {
  try {
    const result = await UserModel.findTrainers();
    res.send(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyTrainer,
  getTrainerApplicationByUser,
  checkTrainerApplication,
  getAllTrainerApplicationsAdmin,
  approveTrainerApplication,
  rejectTrainerApplication,
  deleteTrainerApplication,
  getAllTrainersAdmin,
};
