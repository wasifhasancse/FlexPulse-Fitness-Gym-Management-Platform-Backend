const { ObjectId } = require("mongodb");
const ForumPostModel = require("../models/forumPost.model");
const { ensureUserActive } = require("../middlewares/userCheck.middleware");
const { normalizeStatus, toObjectId } = require("../utils/helpers");

// add a new forum post (auto-approve for trainer/admin)
const createPost = async (req, res, next) => {
  try {
    const activeResult = await ensureUserActive(
      { userId: req.body?.userId, email: req.body?.userEmail },
      res,
    );
    if (!activeResult.ok) return;

    const role = req.body?.userRole || "member";
    const autoApprove = role === "trainer" || role === "admin";

    const newPost = {
      ...req.body,
      createdAt: new Date(),
      status: autoApprove ? "approved" : "pending",
    };
    const result = await ForumPostModel.create(newPost);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// get all forum posts
const getAllPosts = async (req, res, next) => {
  try {
    const { search = "", page, limit, includeAll, userId } = req.query;

    const query = {};

    if (userId) {
      query.userId = userId;
    }

    if (includeAll !== "true") {
      query.status = "approved";
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { userRole: { $regex: search, $options: "i" } },
      ];
    }

    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 0;

    if (parsedLimit > 0) {
      const skip = (parsedPage - 1) * parsedLimit;
      const [items, total] = await Promise.all([
        ForumPostModel.find(query, {
          sort: { createdAt: -1 },
          skip,
          limit: parsedLimit,
        }),
        ForumPostModel.countDocuments(query),
      ]);

      return res.send({
        items,
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1,
      });
    }

    const result = await ForumPostModel.find(query, {
      sort: { createdAt: -1 },
    });
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// get forum posts by user id
const getMyPosts = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const query = { userId };
    const result = await ForumPostModel.findByUserId(userId);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// get a single forum post by forumPost id
const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ForumPostModel.findById(id);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// get featured forum posts
const getFeaturedPosts = async (req, res, next) => {
  try {
    const result = await ForumPostModel.findFeatured(3);
    res.send(result);
  } catch (error) {
    console.error("Error fetching top forum posts:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// like or remove like to a forum post
const togglePostLike = async (req, res, next) => {
  try {
    const { postId, userId } = req.body;

    const activeResult = await ensureUserActive({ userId }, res);
    if (!activeResult.ok) return;

    const post = await ForumPostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likes = post.likes || [];
    const dislikes = post.dislikes || [];
    const alreadyLiked = likes.includes(userId);

    let updatedLikes = [...likes];
    let updatedDislikes = [...dislikes];

    if (alreadyLiked) {
      updatedLikes = updatedLikes.filter((id) => id !== userId);
      await ForumPostModel.updateById(postId, { $pull: { likes: userId } });
      return res.json({
        liked: false,
        likeCount: updatedLikes.length,
        dislikeCount: updatedDislikes.length,
      });
    } else {
      updatedLikes.push(userId);
      updatedDislikes = updatedDislikes.filter((id) => id !== userId);
      await ForumPostModel.updateById(postId, {
        $push: { likes: userId },
        $pull: { dislikes: userId },
      });
      return res.json({
        liked: true,
        likeCount: updatedLikes.length,
        dislikeCount: updatedDislikes.length,
      });
    }
  } catch (error) {
    next(error);
  }
};

// dislike or remove dislike to a forum post
const togglePostDislike = async (req, res, next) => {
  try {
    const { postId, userId } = req.body;

    const activeResult = await ensureUserActive({ userId }, res);
    if (!activeResult.ok) return;

    const post = await ForumPostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likes = post?.likes || [];
    const dislikes = post?.dislikes || [];
    const alreadyDisliked = dislikes.includes(userId);

    let updatedLikes = [...likes];
    let updatedDislikes = [...dislikes];

    if (alreadyDisliked) {
      updatedDislikes = updatedDislikes.filter((id) => id !== userId);
      await ForumPostModel.updateById(postId, { $pull: { dislikes: userId } });
      return res.json({
        disliked: false,
        likeCount: updatedLikes.length,
        dislikeCount: updatedDislikes.length,
      });
    }

    updatedDislikes.push(userId);
    updatedLikes = updatedLikes.filter((id) => id !== userId);
    await ForumPostModel.updateById(postId, {
      $pull: { likes: userId },
      $push: { dislikes: userId },
    });

    return res.json({
      disliked: true,
      likeCount: updatedLikes.length,
      dislikeCount: updatedDislikes.length,
    });
  } catch (error) {
    next(error);
  }
};

// add a comment to a forum post
const addComment = async (req, res, next) => {
  try {
    const { postId, userId, userName, userImage, userRole, content } = req.body;

    const activeResult = await ensureUserActive({ userId }, res);
    if (!activeResult.ok) return;

    const comment = {
      _id: new ObjectId(),
      userId,
      userName,
      userImage: userImage || null,
      userRole,
      content,
      likes: [],
      replies: [],
      createdAt: new Date(),
    };

    await ForumPostModel.updateById(postId, { $push: { comments: comment } });
    res.json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// update a comment in a forum post
const updateComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const { content, userId } = req.body;

    const post = await ForumPostModel.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments?.find((c) => c._id.toString() === commentId);
    if (!comment || comment.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const filter = {
      _id: toObjectId(postId),
      "comments._id": toObjectId(commentId),
    };
    await ForumPostModel.updateById(postId, {
      $set: { "comments.$.content": content, "comments.$.edited": true },
    });

    res.json({ success: true, content });
  } catch (error) {
    next(error);
  }
};

// delete a comment from a forum post
const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body;

    const post = await ForumPostModel.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments?.find((c) => c._id.toString() === commentId);
    if (!comment || comment.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized!" });
    }

    await ForumPostModel.updateById(postId, {
      $pull: { comments: { _id: toObjectId(commentId) } },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// like or remove like to a comment in a forum post
const toggleCommentLike = async (req, res, next) => {
  try {
    const { postId, commentId, userId } = req.body;

    const activeResult = await ensureUserActive({ userId }, res);
    if (!activeResult.ok) return;

    const post = await ForumPostModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments?.find(
      (commentItem) => commentItem._id.toString() === commentId,
    );
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const likes = comment.likes || [];
    const alreadyLiked = likes.includes(userId);

    if (alreadyLiked) {
      const updateDoc = { $pull: { "comments.$.likes": userId } };
      await ForumPostModel.updateById(
        postId,
        updateDoc,
        // Since we are updating specific comment by comments._id:
      );
      // Let's use direct collection update if needed for positional operator:
      const { getForumPostCollection } = require("../config/db");
      await getForumPostCollection().updateOne(
        {
          _id: toObjectId(postId),
          "comments._id": toObjectId(commentId),
        },
        { $pull: { "comments.$.likes": userId } },
      );
      return res.json({ liked: false, likeCount: likes.length - 1 });
    } else {
      const { getForumPostCollection } = require("../config/db");
      await getForumPostCollection().updateOne(
        {
          _id: toObjectId(postId),
          "comments._id": toObjectId(commentId),
        },
        { $push: { "comments.$.likes": userId } },
      );
      return res.json({ liked: true, likeCount: likes.length + 1 });
    }
  } catch (error) {
    next(error);
  }
};

// dislike or remove dislike to a comment in a forum post
const toggleCommentDislike = async (req, res, next) => {
  try {
    const { postId, commentId, userId } = req.body;

    const activeResult = await ensureUserActive({ userId }, res);
    if (!activeResult.ok) return;

    const post = await ForumPostModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post?.comments?.find(
      (commentItem) => commentItem._id.toString() === commentId,
    );
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const dislikes = comment?.dislikes || [];
    const alreadyDisliked = dislikes.includes(userId);
    const { getForumPostCollection } = require("../config/db");

    if (alreadyDisliked) {
      await getForumPostCollection().updateOne(
        {
          _id: toObjectId(postId),
          "comments._id": toObjectId(commentId),
        },
        { $pull: { "comments.$.dislikes": userId } },
      );
      return res.json({ disliked: false, dislikeCount: dislikes.length - 1 });
    }

    await getForumPostCollection().updateOne(
      {
        _id: toObjectId(postId),
        "comments._id": toObjectId(commentId),
      },
      {
        $pull: { "comments.$.likes": userId },
        $push: { "comments.$.dislikes": userId },
      },
    );

    return res.json({ disliked: true, dislikeCount: dislikes.length + 1 });
  } catch (error) {
    next(error);
  }
};

// add a reply to a comment in a forum post
const addReply = async (req, res, next) => {
  try {
    const {
      postId,
      commentId,
      userId,
      userName,
      userImage,
      userRole,
      content,
    } = req.body;

    const activeResult = await ensureUserActive({ userId }, res);
    if (!activeResult.ok) return;

    const reply = {
      _id: new ObjectId(),
      userId,
      userName,
      userImage: userImage || null,
      userRole,
      content,
      likes: [],
      createdAt: new Date(),
    };

    const { getForumPostCollection } = require("../config/db");
    await getForumPostCollection().updateOne(
      { _id: toObjectId(postId), "comments._id": toObjectId(commentId) },
      { $push: { "comments.$.replies": reply } },
    );

    res.json({ success: true, reply });
  } catch (error) {
    next(error);
  }
};

// update a reply in a forum post comment
const updateReply = async (req, res, next) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const { content, userId } = req.body;

    const post = await ForumPostModel.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post?.comments?.find(
      (commentItem) => commentItem._id.toString() === commentId,
    );

    const reply = comment?.replies?.find(
      (replyItem) => replyItem._id.toString() === replyId,
    );

    if (!reply || reply.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { getForumPostCollection } = require("../config/db");
    await getForumPostCollection().updateOne(
      {
        _id: toObjectId(postId),
        "comments._id": toObjectId(commentId),
      },
      {
        $set: {
          "comments.$[c].replies.$[r].content": content,
          "comments.$[c].replies.$[r].edited": true,
        },
      },
      {
        arrayFilters: [
          { "c._id": toObjectId(commentId) },
          { "r._id": toObjectId(replyId) },
        ],
      },
    );

    return res.json({ success: true, content });
  } catch (error) {
    next(error);
  }
};

// delete a reply in a forum post comment
const deleteReply = async (req, res, next) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const { userId } = req.body;

    const post = await ForumPostModel.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post?.comments?.find(
      (commentItem) => commentItem._id.toString() === commentId,
    );

    const reply = comment?.replies?.find(
      (replyItem) => replyItem._id.toString() === replyId,
    );

    if (!reply || reply.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { getForumPostCollection } = require("../config/db");
    await getForumPostCollection().updateOne(
      {
        _id: toObjectId(postId),
        "comments._id": toObjectId(commentId),
      },
      {
        $pull: {
          "comments.$[c].replies": { _id: toObjectId(replyId) },
        },
      },
      {
        arrayFilters: [{ "c._id": toObjectId(commentId) }],
      },
    );

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// delete a forum post by forumPost id
const deleteMyPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ForumPostModel.deleteById(id);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

// approve forum post by admin
const updatePostStatusByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status = "approved" } = req.body;

    const result = await ForumPostModel.updateById(id, {
      $set: {
        status: normalizeStatus(status),
        updatedAt: new Date(),
      },
    });
    res.send(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  getFeaturedPosts,
  togglePostLike,
  togglePostDislike,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  toggleCommentDislike,
  addReply,
  updateReply,
  deleteReply,
  deleteMyPost,
  updatePostStatusByAdmin,
};
