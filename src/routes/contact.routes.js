const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");

router.post("/contact", contactController.submitContactMessage);
router.post("/trial-pass", contactController.claimTrialPass);

module.exports = router;
