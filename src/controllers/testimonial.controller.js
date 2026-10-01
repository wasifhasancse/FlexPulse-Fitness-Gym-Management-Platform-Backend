const TestimonialModel = require("../models/testimonial.model");
const { isValidObjectId } = require("../utils/helpers");

const testimonialController = {
  // Public: Get all approved testimonials for Homepage "Member Voices" section
  getPublicTestimonials: async (req, res, next) => {
    try {
      const testimonials = await TestimonialModel.find(
        { status: "approved" },
        { sort: { createdAt: -1 } }
      );
      res.status(200).json({
        success: true,
        count: testimonials.length,
        items: testimonials,
      });
    } catch (error) {
      next(error);
    }
  },

  // Moderator/Admin: Get all testimonials with optional status filter
  getAllTestimonialsAdminOrTrainer: async (req, res, next) => {
    try {
      const { status, search } = req.query;
      const query = {};

      if (status && status !== "all") {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { quote: { $regex: search, $options: "i" } },
          { discipline: { $regex: search, $options: "i" } },
          { achievement: { $regex: search, $options: "i" } },
        ];
      }

      const testimonials = await TestimonialModel.find(query, {
        sort: { createdAt: -1 },
      });

      res.status(200).json({
        success: true,
        count: testimonials.length,
        items: testimonials,
      });
    } catch (error) {
      next(error);
    }
  },

  // Member: Get own submitted testimonials
  getMyTestimonials: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      if (!userId && !userEmail) {
        return res.status(401).json({
          success: false,
          message: "User authentication required",
        });
      }

      const query = {};
      if (userId && userEmail) {
        query.$or = [{ userId: String(userId) }, { userEmail }];
      } else if (userId) {
        query.userId = String(userId);
      } else {
        query.userEmail = userEmail;
      }

      const testimonials = await TestimonialModel.find(query, {
        sort: { createdAt: -1 },
      });

      res.status(200).json({
        success: true,
        count: testimonials.length,
        items: testimonials,
      });
    } catch (error) {
      next(error);
    }
  },

  // Member: Post a new testimonial (ONLY Member role can post)
  createTestimonial: async (req, res, next) => {
    try {
      const role = (req.user?.role || req.body?.userRole || "").toLowerCase();

      // Only member role can post
      if (role !== "member") {
        return res.status(403).json({
          success: false,
          message: "Only athlete members can post testimonials for the Member Voices section.",
        });
      }

      const {
        quote,
        discipline,
        achievement,
        tenure,
        rating,
        tagColor,
        memberTitle,
      } = req.body;

      if (!quote || quote.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Testimonial quote/story content is required.",
        });
      }

      const newTestimonial = {
        name: req.user?.name || req.body?.name || "Athlete Member",
        userImage: req.user?.image || req.body?.userImage || "https://prio.co.in/avatar.png",
        userId: String(req.user?.id || req.body?.userId || ""),
        userEmail: req.user?.email || req.body?.userEmail || "",
        userRole: "member",
        role: memberTitle || req.body?.role || "Athlete Member",
        tenure: tenure || "Active Member",
        achievement: achievement || "Milestone Achieved",
        discipline: discipline || "Body Recomposition",
        quote: quote.trim(),
        rating: Number(rating) || 5,
        tagColor: tagColor || "bg-active/10 text-active border-active/20",
        status: "pending", // Members submit in pending status
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await TestimonialModel.create(newTestimonial);

      res.status(201).json({
        success: true,
        message: "Your athlete testimonial has been submitted for coach & admin approval.",
        insertedId: result.insertedId,
        testimonial: { ...newTestimonial, _id: result.insertedId },
      });
    } catch (error) {
      next(error);
    }
  },

  // Trainer & Admin: Approve or Reject a testimonial
  updateTestimonialStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be 'approved', 'rejected', or 'pending'.",
        });
      }

      const existing = await TestimonialModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Testimonial not found.",
        });
      }

      const updateDoc = {
        $set: {
          status,
          reviewedBy: req.user?.email,
          reviewedByRole: req.user?.role,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const result = await TestimonialModel.updateById(id, updateDoc);

      res.status(200).json({
        success: true,
        message: `Testimonial status updated to ${status}.`,
        result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Edit Testimonial:
  // - Member can edit ONLY own post
  // - Trainer and Admin can edit ANY member post
  updateTestimonial: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const userRole = (user?.role || "").toLowerCase();

      const existing = await TestimonialModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Testimonial not found.",
        });
      }

      const isOwner =
        (user?.id && String(existing.userId) === String(user.id)) ||
        (user?.email && existing.userEmail === user.email);

      // Authorization check
      if (userRole === "member") {
        if (!isOwner) {
          return res.status(403).json({
            success: false,
            message: "Members can only edit their own testimonials.",
          });
        }
      } else if (userRole !== "admin" && userRole !== "trainer") {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to edit testimonials.",
        });
      }

      const {
        quote,
        discipline,
        achievement,
        tenure,
        rating,
        tagColor,
        memberTitle,
        userImage,
        name,
      } = req.body;

      const setFields = {
        updatedAt: new Date(),
      };

      if (quote !== undefined) setFields.quote = quote.trim();
      if (discipline !== undefined) setFields.discipline = discipline;
      if (achievement !== undefined) setFields.achievement = achievement;
      if (tenure !== undefined) setFields.tenure = tenure;
      if (rating !== undefined) setFields.rating = Number(rating) || 5;
      if (tagColor !== undefined) setFields.tagColor = tagColor;
      if (memberTitle !== undefined) setFields.role = memberTitle;
      else if (req.body.role !== undefined) setFields.role = req.body.role;
      if (userImage !== undefined) setFields.userImage = userImage;
      if (name !== undefined) setFields.name = name;

      // If a member edits an approved post, reset to pending for re-moderation
      if (userRole === "member" && existing.status === "approved") {
        setFields.status = "pending";
      }

      const result = await TestimonialModel.updateById(id, { $set: setFields });

      res.status(200).json({
        success: true,
        message: "Testimonial updated successfully.",
        result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete Testimonial:
  // - Member can delete ONLY own post
  // - Trainer and Admin can delete ANY member post
  deleteTestimonial: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const userRole = (user?.role || "").toLowerCase();

      const existing = await TestimonialModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Testimonial not found.",
        });
      }

      const isOwner =
        (user?.id && String(existing.userId) === String(user.id)) ||
        (user?.email && existing.userEmail === user.email);

      if (userRole === "member") {
        if (!isOwner) {
          return res.status(403).json({
            success: false,
            message: "Members can only delete their own testimonials.",
          });
        }
      } else if (userRole !== "admin" && userRole !== "trainer") {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to delete testimonials.",
        });
      }

      const result = await TestimonialModel.deleteById(id);

      res.status(200).json({
        success: true,
        message: "Testimonial deleted successfully.",
        result,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = testimonialController;
