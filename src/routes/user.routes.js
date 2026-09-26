const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken, adminVerify } = require("../middlewares/auth.middleware");

router.patch("/admin/users/:id/role", userController.updateUserRole);
router.patch("/admin/users/:id/block", userController.blockUser);
router.get("/all-users", userController.getAllUsers);
router.patch(
  "/users/:userId/role",
  verifyToken,
  adminVerify,
  userController.updateTrainerRole,
);
router.get("/trainers", userController.getPublicTrainers);

module.exports = router;
