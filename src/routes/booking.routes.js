const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");

router.post("/bookClass", bookingController.bookClass);
router.get(["/getbookings", "/my-bookings"], bookingController.getUserBookings);
router.get("/checkBooking", bookingController.checkBooking);

module.exports = router;
