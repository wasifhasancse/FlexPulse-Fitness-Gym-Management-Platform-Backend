const express = require("express");
const router = express.Router();
const classController = require("../controllers/class.controller");
const { verifyToken, adminVerify } = require("../middlewares/auth.middleware");

// Public and Member/Trainer Class Routes
router.get("/all-class", classController.getAllClasses);
router.get("/all-classes/:id", classController.getClassById);
router.get("/classBookingCount/:id", verifyToken, classController.getClassBookingCount);
router.get("/getmyclasses", classController.getMyClasses);
router.post("/add-class", classController.addClass);
router.patch("/all-classes/:id", classController.updateClass);
router.delete("/my-class/:id", verifyToken, classController.deleteMyClass);
router.get("/featured-classes", classController.getFeaturedClasses);

// Admin Class Management Routes
router.get("/admin/all-classesByAdmin", classController.getAllClassesByAdmin);
router.patch(
  "/admin/classes/:id",
  verifyToken,
  adminVerify,
  classController.updateClassStatusByAdmin,
);
router.delete(
  "/admin/classes/:id",
  verifyToken,
  adminVerify,
  classController.deleteClassByAdmin,
);

module.exports = router;
