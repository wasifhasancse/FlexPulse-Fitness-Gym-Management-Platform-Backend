const express = require("express");
const router = express.Router();
const trainerApplicationController = require("../controllers/trainerApplication.controller");
const { verifyToken, adminVerify } = require("../middlewares/auth.middleware");

// Member Trainer Application Routes
router.post(
  "/trainer-application",
  trainerApplicationController.applyTrainer,
);
router.get(
  "/trainer-application",
  trainerApplicationController.getTrainerApplicationByUser,
);
router.get(
  "/trainer-application/check",
  trainerApplicationController.checkTrainerApplication,
);

// Admin Trainer Application & Trainers Management
router.get(
  "/admin/trainer-applications",
  verifyToken,
  adminVerify,
  trainerApplicationController.getAllTrainerApplicationsAdmin,
);
router.patch(
  "/admin/trainer-applications/approve/:id",
  verifyToken,
  adminVerify,
  trainerApplicationController.approveTrainerApplication,
);
router.patch(
  "/admin/trainer-applications/reject/:id",
  verifyToken,
  adminVerify,
  trainerApplicationController.rejectTrainerApplication,
);
router.delete(
  "/admin/trainer-applications/:id",
  verifyToken,
  adminVerify,
  trainerApplicationController.deleteTrainerApplication,
);
router.get(
  "/admin/trainers",
  verifyToken,
  adminVerify,
  trainerApplicationController.getAllTrainersAdmin,
);

module.exports = router;
