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
    const bookClassCollection = database.collection("bookClasses");
    const favoriteCollection = database.collection("favoriteClasses");
    const forumPostCollection = database.collection("forumPost");
    const trainerApplicationCollection = database.collection("trainerApplications");
    const userCollection = database.collection("user");

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
