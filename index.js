const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.NEXT_CLIENT_URL}/api/auth/jwks`),
);

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ msg: "Unauthorize" });
  }
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Unauthorize" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "Unauthorize" });
  }
};

// Verify member role middleware
const memberVerify = async (req, res, next) => {
  const user = req.user;
  if (user.role !== "member") {
    return res.status(403).json({ msg: "Forbidden" });
  }
  next();
};

// Verify trainer role middleware
const trainerVerify = async (req, res, next) => {
  const user = req.user;
  if (user.role !== "trainer") {
    return res.status(403).json({ msg: "Forbidden" });
  }
  next();
};

// Verify admin role middleware
const adminVerify = async (req, res, next) => {
  const user = req.user;
  if (user.role !== "admin") {
    return res.status(403).json({ msg: "Forbidden" });
  }
  next();
};

// Verify admin or trainer role middleware
const adminOrTrainerVerify = async (req, res, next) => {
  const user = req.user;
  if (user.role !== "admin" && user.role !== "trainer") {
    return res.status(403).json({ msg: "Forbidden" });
  }
  next();
};

const run = async () => {
  try {
    // await client.connect();
    const database = client.db("flex_pulse");
    const classCollection = database.collection("allClasses");
    const subscriptionsCollection = database.collection("subscriptions");
    const bookingClassCollection = database.collection("bookingClasses");
    const favoriteCollection = database.collection("favoriteClasses");
    const forumPostCollection = database.collection("forumPost");
    const trainerApplicationCollection = database.collection(
      "trainerApplications",
    );
    const userCollection = database.collection("user");

    const normalizeStatus = (value = "") => String(value).trim().toLowerCase();

    const getUserByIdOrEmail = async ({ userId, email }) => {
      if (userId && ObjectId.isValid(userId)) {
        return userCollection.findOne({ _id: new ObjectId(userId) });
      }
      if (email) {
        return userCollection.findOne({ email });
      }
      return null;
    };

    const ensureUserActive = async ({ userId, email }, res) => {
      const user = await getUserByIdOrEmail({ userId, email });
      if (!user) {
        res.status(401).json({ message: "Unauthorize" });
        return { ok: false };
      }

      if (normalizeStatus(user.status) === "banned") {
        res.status(403).json({ message: "Action restricted by Admin" });
        return { ok: false };
      }

      return { ok: true, user };
    };

    app.patch("/api/admin/users/:id/role", async (req, res) => {
      const { id } = req.params;
      const { userRole } = req.body;
      console.log(id, userRole);
      const result = await userCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: userRole } },
      );
      res.send(result);
    });

    // get all users
    app.get("/api/all-users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // get all classes and filter by search and category
    app.get("/api/all-class", async (req, res) => {
      try {
        const {
          search = "",
          category = "",
          page,
          limit,
          includeAll,
        } = req.query;
        const query = {};

        if (includeAll !== "true") {
          query.status = "approved";
        }

        if (search) query.className = { $regex: search, $options: "i" };

        if (category && category !== "All Categories") {
          const categories = category
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);

          if (categories.length > 0) {
            query.category = { $in: categories };
          }
        }

        const parsedPage = Number(page) || 1;
        const parsedLimit = Number(limit) || 0;

        if (parsedLimit > 0) {
          const skip = (parsedPage - 1) * parsedLimit;
          const [items, total] = await Promise.all([
            classCollection
              .find(query)
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(parsedLimit)
              .toArray(),
            classCollection.countDocuments(query),
          ]);

          return res.send({
            items,
            total,
            page: parsedPage,
            limit: parsedLimit,
            totalPages: Math.ceil(total / parsedLimit) || 1,
          });
        }

        const result = await classCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
        return res.send(result);
      } catch (error) {
        console.error("Error:", error.message);
        res.status(500).send({ message: error.message });
      }
    });

    // get a single class by class id
    app.get("/api/all-classes/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await classCollection.findOne(query);
      res.send(result || {});
    });

    // get a single trainer's classes by trainer id
    app.get("/api/getmyclasses", async (req, res) => {
      const { trainerId } = req.query;
      const query = { authorId: trainerId };
      const result = await classCollection.find(query).toArray();
      res.send(result || {});
    });

    // add a new class
    app.post("/api/add-class", async (req, res) => {
      const activeResult = await ensureUserActive(
        { userId: req.body?.authorId, email: req.body?.authorEmail },
        res,
      );
      if (!activeResult.ok) return;

      const data = req.body;
      const newData = {
        ...data,
        createdAt: new Date(),
        status: data?.status || "pending",
      };
      const result = await classCollection.insertOne(newData);
      res.send(result);
    });

    // update a class by class id
    app.patch("/api/all-classes/:id", async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;
      const result = await classCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData },
      );
      res.send(result);
    });

    // delete a class by class id
    app.delete("/api/my-class/:id", async (req, res) => {
      const { id } = req.params;
      const result = await classCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    //  add a new subscription
    app.post("/api/subscription", async (req, res) => {
      const { sessionId, userId, priceId } = req.body;

      const activeResult = await ensureUserActive({ userId }, res);
      if (!activeResult.ok) return;

      const isExist = await subscriptionsCollection.findOne({ sessionId });
      if (isExist) return res.json({ msg: "Subscription already exists!" });
      await subscriptionsCollection.insertOne({ sessionId, userId, priceId });
      await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { plan: "pro" } },
      );
      res.json({ msg: "Subscription added successfully!" });
    });

    // add a new forum post (auto-approve for trainer/admin)
    app.post("/api/forumPost", async (req, res) => {
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
      const result = await forumPostCollection.insertOne(newPost);
      res.status(200).json(result);
    });

    // get all forum posts
    app.get("/api/forumPost", async (req, res) => {
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
          forumPostCollection
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parsedLimit)
            .toArray(),
          forumPostCollection.countDocuments(query),
        ]);

        return res.send({
          items,
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit) || 1,
        });
      }

      const result = await forumPostCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // get forum posts by user id
    app.get("/api/my-forumPost", async (req, res) => {
      const { userId } = req.query;
      const query = { userId: userId };
      const result = await forumPostCollection.find(query).toArray();
      res.send(result);
    });

    // get a single forum post by forumPost id
    app.get("/api/forumPost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await forumPostCollection.findOne(query);
      res.send(result);
    });

    // like or remove like to a forum post
    app.post("/api/forum/like", async (req, res) => {
      const { postId, userId } = req.body;

      const activeResult = await ensureUserActive({ userId }, res);
      if (!activeResult.ok) return;

      const post = await forumPostCollection.findOne({
        _id: new ObjectId(postId),
      });

      const likes = post.likes || [];
      const dislikes = post.dislikes || [];
      const alreadyLiked = likes.includes(userId);

      let updatedLikes = [...likes];
      let updatedDislikes = [...dislikes];

      if (alreadyLiked) {
        updatedLikes = updatedLikes.filter(id => id !== userId);
        await forumPostCollection.updateOne(
          { _id: new ObjectId(postId) },
          { $pull: { likes: userId } },
        );
        res.json({ liked: false, likeCount: updatedLikes.length, dislikeCount: updatedDislikes.length });
      } else {
        updatedLikes.push(userId);
        updatedDislikes = updatedDislikes.filter(id => id !== userId);
        await forumPostCollection.updateOne(
          { _id: new ObjectId(postId) },
          {
            $push: { likes: userId },
            $pull: { dislikes: userId }
          },
        );
        res.json({ liked: true, likeCount: updatedLikes.length, dislikeCount: updatedDislikes.length });
      }
    });

    // dislike or remove dislike to a forum post
    app.post("/api/forum/dislike", async (req, res) => {
      const { postId, userId } = req.body;

      const activeResult = await ensureUserActive({ userId }, res);
      if (!activeResult.ok) return;

      const post = await forumPostCollection.findOne({
        _id: new ObjectId(postId),
      });

      const likes = post?.likes || [];
      const dislikes = post?.dislikes || [];
      const alreadyDisliked = dislikes.includes(userId);

      let updatedLikes = [...likes];
      let updatedDislikes = [...dislikes];

      if (alreadyDisliked) {
        updatedDislikes = updatedDislikes.filter(id => id !== userId);
        await forumPostCollection.updateOne(
          { _id: new ObjectId(postId) },
          { $pull: { dislikes: userId } },
        );
        return res.json({ disliked: false, likeCount: updatedLikes.length, dislikeCount: updatedDislikes.length });
      }

      updatedDislikes.push(userId);
      updatedLikes = updatedLikes.filter(id => id !== userId);
      await forumPostCollection.updateOne(
        { _id: new ObjectId(postId) },
        {
          $pull: { likes: userId },
          $push: { dislikes: userId },
        },
      );

      return res.json({ disliked: true, likeCount: updatedLikes.length, dislikeCount: updatedDislikes.length });
    });

    // add a comment to a forum post
    app.post("/api/forum/comment", async (req, res) => {
      const { postId, userId, userName, userImage, userRole, content } =
        req.body;

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
      await forumPostCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $push: { comments: comment } },
      );
      res.json({ success: true, comment });
    });

    // update a comment in a forum post
    app.put("/api/forum/comment/:postId/:commentId", async (req, res) => {
      const { postId, commentId } = req.params;
      const { content, userId } = req.body;

      const post = await forumPostCollection.findOne({
        _id: new ObjectId(postId),
      });
      const comment = post.comments.find((c) => c._id.toString() === commentId);

      if (comment.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await forumPostCollection.updateOne(
        { _id: new ObjectId(postId), "comments._id": new ObjectId(commentId) },
        { $set: { "comments.$.content": content, "comments.$.edited": true } },
      );

      res.json({ success: true, content });
    });

    // delete a comment from a forum post
    app.delete("/api/forum/comment/:postId/:commentId", async (req, res) => {
      const { postId, commentId } = req.params;
      const { userId } = req.body;

      const post = await forumPostCollection.findOne({
        _id: new ObjectId(postId),
      });
      const comment = post.comments.find((c) => c._id.toString() === commentId);

      if (comment.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized!" });
      }

      await forumPostCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $pull: { comments: { _id: new ObjectId(commentId) } } },
      );

      res.json({ success: true });
    });

    // like or remove like to a comment in a forum post
    app.post("/api/forum/comment/like", async (req, res) => {
      const { postId, commentId, userId } = req.body;

      const activeResult = await ensureUserActive({ userId }, res);
      if (!activeResult.ok) return;

      const post = await forumPostCollection.findOne({
        _id: new ObjectId(postId),
      });
      const comment = post.comments.find(
        (comment) => comment._id.toString() === commentId,
      );
      const likes = comment.likes || [];
      const alreadyLiked = likes.includes(userId);

      if (alreadyLiked) {
        await forumPostCollection.updateOne(
          {
            _id: new ObjectId(postId),
            "comments._id": new ObjectId(commentId),
          },
          { $pull: { "comments.$.likes": userId } },
        );
        res.json({ liked: false, likeCount: likes.length - 1 });
      } else {
        await forumPostCollection.updateOne(
          {
            _id: new ObjectId(postId),
            "comments._id": new ObjectId(commentId),
          },
          { $push: { "comments.$.likes": userId } },
        );
        res.json({ liked: true, likeCount: likes.length + 1 });
      }
    });

    // dislike or remove dislike to a comment in a forum post
    app.post("/api/forum/comment/dislike", async (req, res) => {
      const { postId, commentId, userId } = req.body;

      const activeResult = await ensureUserActive({ userId }, res);
      if (!activeResult.ok) return;

      const post = await forumPostCollection.findOne({
        _id: new ObjectId(postId),
      });

      const comment = post?.comments?.find(
        (commentItem) => commentItem._id.toString() === commentId,
      );

      const dislikes = comment?.dislikes || [];
      const alreadyDisliked = dislikes.includes(userId);

      if (alreadyDisliked) {
        await forumPostCollection.updateOne(
          {
            _id: new ObjectId(postId),
            "comments._id": new ObjectId(commentId),
          },
          { $pull: { "comments.$.dislikes": userId } },
        );
        return res.json({ disliked: false, dislikeCount: dislikes.length - 1 });
      }

      await forumPostCollection.updateOne(
        {
          _id: new ObjectId(postId),
          "comments._id": new ObjectId(commentId),
        },
        {
          $pull: { "comments.$.likes": userId },
          $push: { "comments.$.dislikes": userId },
        },
      );

      return res.json({ disliked: true, dislikeCount: dislikes.length + 1 });
    });

    // add a reply to a comment in a forum post
    app.post("/api/forum/reply", async (req, res) => {
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

      await forumPostCollection.updateOne(
        { _id: new ObjectId(postId), "comments._id": new ObjectId(commentId) },
        { $push: { "comments.$.replies": reply } },
      );

      res.json({ success: true, reply });
    });

    // update a reply in a forum post comment
    app.put(
      "/api/forum/reply/:postId/:commentId/:replyId",
      async (req, res) => {
        const { postId, commentId, replyId } = req.params;
        const { content, userId } = req.body;

        const post = await forumPostCollection.findOne({
          _id: new ObjectId(postId),
        });

        const comment = post?.comments?.find(
          (commentItem) => commentItem._id.toString() === commentId,
        );

        const reply = comment?.replies?.find(
          (replyItem) => replyItem._id.toString() === replyId,
        );

        if (!reply || reply.userId !== userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }

        await forumPostCollection.updateOne(
          {
            _id: new ObjectId(postId),
            "comments._id": new ObjectId(commentId),
          },
          {
            $set: {
              "comments.$[c].replies.$[r].content": content,
              "comments.$[c].replies.$[r].edited": true,
            },
          },
          {
            arrayFilters: [
              { "c._id": new ObjectId(commentId) },
              { "r._id": new ObjectId(replyId) },
            ],
          },
        );

        return res.json({ success: true, content });
      },
    );

    // delete a reply in a forum post comment
    app.delete(
      "/api/forum/reply/:postId/:commentId/:replyId",
      async (req, res) => {
        const { postId, commentId, replyId } = req.params;
        const { userId } = req.body;

        const post = await forumPostCollection.findOne({
          _id: new ObjectId(postId),
        });

        const comment = post?.comments?.find(
          (commentItem) => commentItem._id.toString() === commentId,
        );

        const reply = comment?.replies?.find(
          (replyItem) => replyItem._id.toString() === replyId,
        );

        if (!reply || reply.userId !== userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }

        await forumPostCollection.updateOne(
          {
            _id: new ObjectId(postId),
            "comments._id": new ObjectId(commentId),
          },
          {
            $pull: {
              "comments.$[c].replies": { _id: new ObjectId(replyId) },
            },
          },
          {
            arrayFilters: [{ "c._id": new ObjectId(commentId) }],
          },
        );

        return res.json({ success: true });
      },
    );

    // delete a forum post by forumPost id
    app.delete("/api/my-post/:id", async (req, res) => {
      const { id } = req.params;
      const result = await forumPostCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // add a new booking class
    app.post("/api/bookClass", async (req, res) => {
      const activeResult = await ensureUserActive(
        { userId: req.body?.userId, email: req.body?.userEmail },
        res,
      );
      if (!activeResult.ok) return;

      const result = await bookingClassCollection.insertOne({
        ...req.body,
        bookedAt: new Date(),
      });

      // increment bookingCount on the class
      if (req.body?.classId && ObjectId.isValid(req.body.classId)) {
        await classCollection.updateOne(
          { _id: new ObjectId(req.body.classId) },
          { $inc: { bookingCount: 1 } },
        );
      }

      res.status(200).json(result);
    });

    // get all bookings by user id
    app.get(["/api/getbookings", "/api/my-bookings"], async (req, res) => {
      const { userId } = req.query;
      const query = { userId: userId };
      const result = await bookingClassCollection.find(query).toArray();
      res.send(result);
    });

    // check if a user has booked a class
    app.get("/api/checkBooking", async (req, res) => {
      const { userId, classId } = req.query;
      const existing = await bookingClassCollection.findOne({
        userId,
        classId,
      });
      res.status(200).json({ isBooked: !!existing });
    });

    // add or remove toggle a class from favorites
    app.post("/api/favorites", async (req, res) => {
      const { userId, classId } = req.body;

      const activeResult = await ensureUserActive({ userId }, res);
      if (!activeResult.ok) return;

      const existing = await favoriteCollection.findOne({ userId, classId });
      if (existing) {
        await favoriteCollection.deleteOne({ userId, classId });
        res.status(200).json({
          isFavorite: false,
          message: "Removed this class from favorites",
        });
      } else {
        await favoriteCollection.insertOne({
          ...req.body,
          createdAt: new Date(),
        });
        res
          .status(200)
          .json({ isFavorite: true, message: "Added this class to favorites" });
      }
    });

    // delete a class from favorites
    app.delete("/api/favorites", async (req, res) => {
      const { userId, classId } = req.body;
      const result = await favoriteCollection.deleteOne({ userId, classId });
      res.json(result);
    });

    // get all favorite classes by user id
    app.get("/api/favorites", async (req, res) => {
      const { userId } = req.query;
      const favorites = await favoriteCollection.find({ userId }).toArray();
      res.status(200).json(favorites);
    });

    // check if a class is in user's favorites
    app.get("/api/favorites/check", async (req, res) => {
      const { userId, classId } = req.query;
      const existing = await favoriteCollection.findOne({ userId, classId });
      res.status(200).json({ isFavorite: !!existing });
    });

    // add a new trainer application
    app.post("/api/trainer-application", async (req, res) => {
      const { userId } = req.body;

      const activeResult = await ensureUserActive({ userId }, res);
      if (!activeResult.ok) return;

      const existing = await trainerApplicationCollection.findOne({ userId });
      if (existing) {
        return res.status(400).json({ error: "Already applied!" });
      }
      const result = await trainerApplicationCollection.insertOne(req.body);
      res.json(result);
    });

    // get all class records for admin dashboard moderation
    app.get("/api/admin/all-classesByAdmin", async (req, res) => {
      const result = await classCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // approve / reject class by admin
    app.patch(
      "/api/admin/classes/:id",
      verifyToken,
      adminVerify,
      async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        const result = await classCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: normalizeStatus(status), updatedAt: new Date() } },
        );
        res.send(result);
      },
    );

    // delete class by admin
    app.delete(
      "/api/admin/classes/:id",
      verifyToken,
      adminVerify,
      async (req, res) => {
        const { id } = req.params;
        const result = await classCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      },
    );

    // get all trainer applications for admin
    app.get(
      "/api/admin/trainer-applications",
      verifyToken,
      adminVerify,
      async (req, res) => {
        const result = await trainerApplicationCollection
          .find()
          .sort({ appliedAt: -1 })
          .toArray();
        res.send(result);
      },
    );

    // approve a trainer application
    app.patch(
      "/api/admin/trainer-applications/approve/:id",
      verifyToken,
      adminVerify,
      async (req, res) => {
        const { id } = req.params;
        const { feedback = "" } = req.body;

        const application = await trainerApplicationCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!application) {
          return res.status(404).json({ message: "Application not found" });
        }

        await trainerApplicationCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: "approved",
              feedback,
              reviewedAt: new Date(),
            },
          },
        );

        if (ObjectId.isValid(application.userId)) {
          await userCollection.updateOne(
            { _id: new ObjectId(application.userId) },
            {
              $set: {
                role: "trainer",
              },
            },
          );
        }

        return res.json({ success: true });
      },
    );

    // reject a trainer application
    app.patch(
      "/api/admin/trainer-applications/reject/:id",
      verifyToken,
      adminVerify,
      async (req, res) => {
        const { id } = req.params;
        const { feedback = "" } = req.body;

        await trainerApplicationCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: "rejected",
              feedback,
              reviewedAt: new Date(),
            },
          },
        );

        return res.json({ success: true });
      },
    );

    // delete trainer application
    app.delete(
      "/api/admin/trainer-applications/:id",
      verifyToken,
      adminVerify,
      async (req, res) => {
        const { id } = req.params;
        const result = await trainerApplicationCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      },
    );

    // get all trainers
    app.get(
      "/api/admin/trainers",
      verifyToken,
      adminVerify,
      async (req, res) => {
        const result = await userCollection.find({ role: "trainer" }).toArray();
        res.send(result);
      },
    );

    // update user role (used for trainer demotion)
    app.patch(
      "/api/users/:userId/role",
      verifyToken,
      adminVerify,
      async (req, res) => {
        const { userId } = req.params;
        const { role } = req.body;

        const result = await userCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { role } },
        );

        if (role === "member") {
          await trainerApplicationCollection.updateMany(
            { userId },
            { $set: { status: "demoted", reviewedAt: new Date() } },
          );
        }

        res.send(result);
      },
    );

    // get admin dashboard stats
    app.get("/api/admin/stats", verifyToken, adminVerify, async (req, res) => {
      const [totalUsers, totalClasses, totalBookings] = await Promise.all([
        userCollection.countDocuments(),
        classCollection.countDocuments(),
        bookingClassCollection.countDocuments(),
      ]);
      res.json({ totalUsers, totalClasses, totalBookings });
    });

    // get trainer dashboard stats (total students enrolled)
    app.get("/api/trainer/stats", async (req, res) => {
      const { trainerId } = req.query;
      if (!trainerId) return res.status(400).json({ message: "trainerId required" });

      const trainerClasses = await classCollection.find({ authorId: trainerId }).toArray();
      const classIds = trainerClasses.map((cls) => String(cls._id));

      const totalStudents = await bookingClassCollection.countDocuments({
        classId: { $in: classIds },
      });

      res.json({ totalStudents, totalClasses: trainerClasses.length });
    });

    // get students for a specific class (trainer)
    app.get("/api/trainer/classes/:classId/students", async (req, res) => {
      const { classId } = req.params;
      const bookings = await bookingClassCollection.find({ classId }).toArray();
      const students = bookings.map((b) => ({ name: b.userName, email: b.userEmail }));
      res.json(students);
    });

    // get featured classes (most booked)
    app.get("/api/featured-classes", async (req, res) => {

        const classes = await classCollection
          .find({ status: "approved" })
          .sort({ bookingCount: -1 })
          .limit(6)
          .toArray();
        res.send(classes);

    });

    // get all transactions for admin
    app.get("/api/transactions", verifyToken, adminVerify, async (req, res) => {
      const [bookings, subscriptions] = await Promise.all([
        bookingClassCollection.find().sort({ bookedAt: -1 }).toArray(),
        subscriptionsCollection.find().sort({ createdAt: -1 }).toArray(),
      ]);

      const normalizedBookings = bookings.map((item) => ({
        ...item,
        amount: Number(item.price) || 0,
        date: item.bookedAt || item.createdAt,
      }));

      const normalizedSubscriptions = subscriptions.map((item) => ({
        ...item,
        amount: Number(item.amount) || 0,
        date: item.createdAt,
        userEmail: item.userEmail || "N/A",
      }));

      const result = [...normalizedBookings, ...normalizedSubscriptions].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );

      res.send(result);
    });

    // approve forum post by admin
    app.patch(
      "/api/admin/forum-posts/:id",
      verifyToken,
      adminVerify,
      async (req, res) => {
        const { id } = req.params;
        const { status = "approved" } = req.body;

        const result = await forumPostCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: normalizeStatus(status),
              updatedAt: new Date(),
            },
          },
        );
        res.send(result);
      },
    );

    // get a trainer application by user id
    app.get("/api/trainer-application", async (req, res) => {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({
          message: "Missing userId in query parameters",
        });
      }
      const result = await trainerApplicationCollection.findOne({ userId });
      res.json(result || {});
    });

    // check if a user has applied for trainer application
    app.get("/api/trainer-application/check", async (req, res) => {
      const { userId } = req.query;
      const existing = await trainerApplicationCollection.findOne({ userId });
      res.json({ hasApplied: !!existing, status: existing?.status || null });
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!",
    // );
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Flex Pulse Server!");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
