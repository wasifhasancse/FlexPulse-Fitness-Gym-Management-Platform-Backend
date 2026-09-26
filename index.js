const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();

const app = require("./src/app");
const { connectDB } = require("./src/config/db");

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== "test") {
      app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
      });
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
