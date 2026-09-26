const express = require("express");
const router = express.Router();

const userRoutes = require("./user.routes");
const classRoutes = require("./class.routes");
const bookingRoutes = require("./booking.routes");
const favoriteRoutes = require("./favorite.routes");
const forumRoutes = require("./forum.routes");
const transactionRoutes = require("./transaction.routes");
const subscriptionRoutes = require("./subscription.routes");
const trainerApplicationRoutes = require("./trainerApplication.routes");
const statsRoutes = require("./stats.routes");

// Mount all modular routes
router.use(userRoutes);
router.use(classRoutes);
router.use(bookingRoutes);
router.use(favoriteRoutes);
router.use(forumRoutes);
router.use(transactionRoutes);
router.use(subscriptionRoutes);
router.use(trainerApplicationRoutes);
router.use(statsRoutes);

module.exports = router;
