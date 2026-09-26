const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forum.controller");
const { verifyToken, adminVerify } = require("../middlewares/auth.middleware");

// Post Routes
router.post("/forumPost", forumController.createPost);
router.get("/forumPost", forumController.getAllPosts);
router.get("/my-forumPost", forumController.getMyPosts);
router.get("/featured-forumPost", forumController.getFeaturedPosts);
router.get("/forumPost/:id", forumController.getPostById);
router.delete("/my-post/:id", forumController.deleteMyPost);

// Post Likes/Dislikes
router.post("/forum/like", forumController.togglePostLike);
router.post("/forum/dislike", forumController.togglePostDislike);

// Comments
router.post("/forum/comment", forumController.addComment);
router.put("/forum/comment/:postId/:commentId", forumController.updateComment);
router.delete("/forum/comment/:postId/:commentId", forumController.deleteComment);
router.post("/forum/comment/like", forumController.toggleCommentLike);
router.post("/forum/comment/dislike", forumController.toggleCommentDislike);

// Replies
router.post("/forum/reply", forumController.addReply);
router.put("/forum/reply/:postId/:commentId/:replyId", forumController.updateReply);
router.delete("/forum/reply/:postId/:commentId/:replyId", forumController.deleteReply);

// Admin Forum Management
router.patch(
  "/admin/forum-posts/:id",
  verifyToken,
  adminVerify,
  forumController.updatePostStatusByAdmin,
);

module.exports = router;
