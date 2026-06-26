const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    // get all users
    app.get("/api/all-users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // get all classes and filter by search and category
    app.get("/api/all-class", async (req, res) => {
      try {
        const { search = "", category = "" } = req.query;
        const query = {};
        if (search) query.className = { $regex: search, $options: "i" };
        if (category && category !== "All Categories")
          query.category = category;
        const result = await classCollection.find(query).toArray();
        res.send(result);
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
      const data = req.body;
      const newData = {
        ...data,
        createdAt: new Date(),
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
      const isExist = await subscriptionsCollection.findOne({ sessionId });
      if (isExist) return res.json({ msg: "Subscription already exists!" });
      await subscriptionsCollection.insertOne({ sessionId, userId, priceId });
      await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { plan: "pro" } },
      );
      res.json({ msg: "Subscription added successfully!" });
    });

    // add a new forum post
    app.post("/api/forumPost", async (req, res) => {
      const newPost = {
        ...req.body,
        createdAt: new Date(),
        status: "pending",
      };
      const result = await forumPostCollection.insertOne(newPost);
      res.status(200).json(result);
    });

    // get all forum posts
    app.get("/api/forumPost", async (req, res) => {
      const result = await forumPostCollection.find().toArray();
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
      const post = await forumPostCollection.findOne({
        _id: new ObjectId(postId),
      });

      const likes = post.likes || [];
      const alreadyLiked = likes.includes(userId);

      if (alreadyLiked) {
        await forumPostCollection.updateOne(
          { _id: new ObjectId(postId) },
          { $pull: { likes: userId } },
        );
        res.json({ liked: false, likeCount: likes.length - 1 });
      } else {
        await forumPostCollection.updateOne(
          { _id: new ObjectId(postId) },
          { $push: { likes: userId } },
        );
        res.json({ liked: true, likeCount: likes.length + 1 });
      }
    });

    // add a comment to a forum post
    app.post("/api/forum/comment", async (req, res) => {
      const { postId, userId, userName, userImage, userRole, content } =
        req.body;
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
      const result = await bookingClassCollection.insertOne(req.body);
      res.status(200).json(result);
    });

    // get all bookings by user id
    app.get("/api/getbookings", async (req, res) => {
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

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
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
