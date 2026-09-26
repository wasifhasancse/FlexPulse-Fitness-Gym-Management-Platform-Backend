const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");
const { verifyToken, adminVerify } = require("../middlewares/auth.middleware");

router.get(
  "/admin/stats",
  verifyToken,
  adminVerify,
  statsController.getAdminStats,
);
router.get("/trainer/stats", statsController.getTrainerStats);
router.get(
  "/trainer/classes/:classId/students",
  statsController.getTrainerClassStudents,
);

module.exports = router;
