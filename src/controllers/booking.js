const Booking = require("../models/Booking");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

// GET ALL BOOKINGSS
const getAllBookings = async (req, res) => {
  const bookings = await Booking.find({ createdBy: req.user.userId }).sort(
    "createdAt"
  );
  res.status(StatusCodes.OK).json({ bookings, count: bookings.length });
};
// GET SINGLE BOOKING
const getBooking = async (req, res) => {
  const {
    user: { userId },
    params: { id: bookingId },
  } = req;
  const booking = await Booking.findOne({ _id: bookingId, createdBy: userId });

  if (!booking) {
    throw new NotFoundError(`No booking found with id: ${bookingId}`);
  }
  res.status(StatusCodes.OK).json({ booking });
};
// CREATE BOOKING
const createBooking = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const booking = await Booking.create(req.body);
  res.status(StatusCodes.CREATED).json({ booking });
};
//UPDATE BOOKING
const updateBooking = async (req, res) => {
  const {
    body: {
      startDate,
      endDate,
      numberOfAdults,
      numberOfKids,
      numberOfRooms,
      status,
    },
    user: { userId },
    params: { id: bookingId },
  } = req;
  if (!startDate || !endDate || !numberOfAdults || !numberOfRooms) {
    throw new BadRequestError(
      "Start date, end date, or number of guests or rooms cannot be empty"
    );
  }
  const booking = await Booking.findByIdAndUpdate(
    { _id: bookingId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!booking) {
    throw new NotFoundError(`No booking found with id: ${bookingId}`);
  }
  res.status(StatusCodes.OK).json({ booking });
};

const deleteBooking = async (req, res) => {
  const {
    user: { userId },
    params: { id: bookingId },
  } = req;
  const booking = await Booking.findOneAndRemove({
    _id: bookingId,
    createdBy: userId,
  });
  if (!booking) {
    throw new NotFoundError(`No booking found with id: ${bookingId}`);
  }
  res.status(StatusCodes.OK).json({ msg: "The entry was deleted." });
};

module.exports = {
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
};
