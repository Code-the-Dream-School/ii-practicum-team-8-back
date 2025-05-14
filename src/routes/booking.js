const express = require("express");
const router = express.Router();

const {
  getAllBookings,
  getMyBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/booking");

router.route("/").post(createBooking).get(getMyBookings);
router.route("/all").get(getAllBookings);
router.route("/:id").get(getBooking).delete(deleteBooking).patch(updateBooking);

module.exports = router;
