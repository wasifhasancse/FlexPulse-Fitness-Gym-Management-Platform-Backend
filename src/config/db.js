require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;

let client = null;
let db = null;

const getClient = () => {
  if (!client) {
    if (!uri) {
      console.warn("MONGODB_URI is not defined in environment variables.");
    }
    client = new MongoClient(uri || "", {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
  }
  return client;
};

const getDatabase = () => {
  if (!db) {
    const cli = getClient();
    db = cli.db("flex_pulse");
  }
  return db;
};

const connectDB = async () => {
  try {
    const cli = getClient();
    await cli.connect();
    db = cli.db("flex_pulse");
    console.log("MongoDB connection established successfully.");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return getDatabase();
  }
};

const getUserCollection = () => getDatabase().collection("user");
const getClassCollection = () => getDatabase().collection("allClasses");
const getBookingCollection = () => getDatabase().collection("bookingClasses");
const getFavoriteCollection = () => getDatabase().collection("favoriteClasses");
const getForumPostCollection = () => getDatabase().collection("forumPost");
const getTransactionCollection = () => getDatabase().collection("transactions");
const getSubscriptionCollection = () => getDatabase().collection("subscriptions");
const getTrainerApplicationCollection = () =>
  getDatabase().collection("trainerApplications");

module.exports = {
  getClient,
  connectDB,
  getDatabase,
  getUserCollection,
  getClassCollection,
  getBookingCollection,
  getFavoriteCollection,
  getForumPostCollection,
  getTransactionCollection,
  getSubscriptionCollection,
  getTrainerApplicationCollection,
};
