const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonial.controller");
const {
  verifyToken,
  memberVerify,
  adminOrTrainerVerify,
} = require("../middlewares/auth.middleware");

// 1. Public route: Get all approved testimonials for Homepage "Member Voices" section
router.get("/testimonials", testimonialController.getPublicTestimonials);

// 2. Moderator route: Get all testimonials for Trainer & Admin dashboard
router.get(
  "/testimonials/manage",
  verifyToken,
  adminOrTrainerVerify,
  testimonialController.getAllTestimonialsAdminOrTrainer
);

// 3. Member route: Get member's own testimonials
router.get(
  "/my-testimonials",
  verifyToken,
  testimonialController.getMyTestimonials
);

// 4. Member route: Submit a new testimonial (ONLY Member role)
router.post(
  "/testimonials",
  verifyToken,
  memberVerify,
  testimonialController.createTestimonial
);

// 5. Update testimonial details (Member only own, Trainer/Admin any)
router.put(
  "/testimonials/:id",
  verifyToken,
  testimonialController.updateTestimonial
);
router.patch(
  "/testimonials/:id",
  verifyToken,
  testimonialController.updateTestimonial
);

// 6. Moderator route: Approve or Reject a testimonial (Trainer & Admin)
router.patch(
  "/testimonials/:id/status",
  verifyToken,
  adminOrTrainerVerify,
  testimonialController.updateTestimonialStatus
);

// 7. Delete testimonial (Member only own, Trainer/Admin any)
router.delete(
  "/testimonials/:id",
  verifyToken,
  testimonialController.deleteTestimonial
);

module.exports = router;
