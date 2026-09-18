const dns = require("node:dns");
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (e) {
  // ignore if already set
}
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.DATABASE_URL;

if (!uri) {
  console.error("DATABASE_URL is not set in environment variables!");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let dbInstance = null;

const connectDB = async () => {
  if (dbInstance) return dbInstance;
  try {
    await client.connect();
    dbInstance = client.db("flex_pulse");
    console.log("MongoDB connection established successfully.");
    return dbInstance;
  } catch (error) {
    console.error("Failed to connect to MongoDB Atlas:", error.message);
    process.exit(1);
  }
};

const getDatabase = () => {
  if (!dbInstance) {
    throw new Error("Database not initialized. Please call connectDB first.");
  }
  return dbInstance;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed.");
  }
};

module.exports = {
  connectDB,
  getDatabase,
  closeDB,
  client,
};
