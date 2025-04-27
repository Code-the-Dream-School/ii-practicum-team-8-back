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
  const { startDate, endDate } = req.body;
  // check if startDate less and not same as endDate
  if (!startDate || !endDate) {
    throw new BadRequestError("Start and end dates are required.");
  }
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    throw new BadRequestError("Check-out date must be after check-in date.");
  }
  // check for overlapping booking
  const overlappingBooking = await Booking.findOne({
    status: { $in: ["pending", "confirmed"] },
    startDate: { $lt: new Date(endDate) },
    endDate: { $gt: new Date(startDate) },
  });

  if (overlappingBooking) {
    throw new BadRequestError(
      "Selected dates are already booked. Please choose different dates."
    );
  }
  // create booking if no overlapping dates
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
  // check if startDate less and not same as endDate
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    throw new BadRequestError("Check-out date must be after check-in date.");
  }
  // checks for overlapping booking
  const overlappingBooking = await Booking.findOne({
    _id: { $ne: bookingId },
    status: { $in: ["pending", "confirmed"] },
    startDate: { $lt: new Date(endDate) },
    endDate: { $gt: new Date(startDate) },
  });

  if (overlappingBooking) {
    throw new BadRequestError(
      "Selected dates are already booked. Please choose different dates."
    );
  }
  // update booking if no overlapping
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
  const booking = await Booking.findOneAndDelete({
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
