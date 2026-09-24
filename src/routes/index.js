const express = require("express");
const router = express.Router();

const userRoutes = require("./user.routes");
const classRoutes = require("./class.routes");
const forumRoutes = require("./forum.routes");
const newsletterRoutes = require("./newsletter.routes");
const paymentRoutes = require("./payment.routes");
const transactionRoutes = require("./transaction.routes");
const subscriptionRoutes = require("./subscription.routes");
const trainerApplicationRoutes = require("./trainerApplication.routes");
const statsRoutes = require("./stats.routes");
const contactRoutes = require("./contact.routes");

// Mount all modular routes
router.use(userRoutes);
router.use(classRoutes);
router.use(forumRoutes);
router.use(newsletterRoutes);
router.use(paymentRoutes);
router.use(transactionRoutes);
router.use(subscriptionRoutes);
router.use(trainerApplicationRoutes);
router.use(statsRoutes);
router.use(contactRoutes);

module.exports = router;
