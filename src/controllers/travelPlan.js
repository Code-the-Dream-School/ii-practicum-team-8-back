const TravelPlan = require("../models/TravelPlan");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

// GET ALL Travel Plans
const getAllTravelPlans = async (req, res) => {
  const travelPlans = await TravelPlan.find({
    createdBy: req.user.userId,
  }).sort("createdAt");
  res.status(StatusCodes.OK).json({ travelPlans, count: travelPlans.length });
};
// GET SINGLE Travel Plan
const getTravelPlan = async (req, res) => {
  const {
    user: { userId },
    params: { id: travelPlanId },
  } = req;
  const travelPlan = await TravelPlan.findOne({
    _id: travelPlanId,
    createdBy: userId,
  });

  if (!travelPlan) {
    throw new NotFoundError(`No travel plan found with id: ${travelPlanId}`);
  }
  res.status(StatusCodes.OK).json({ travelPlan });
};
// CREATE Travel Plan
const createTravelPlan = async (req, res) => {
  const { startDate, endDate } = req.body;
  // check if startDate less and not same as endDate
  if (!startDate || !endDate) {
    throw new BadRequestError("Start and end dates are required.");
  }
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    throw new BadRequestError("Departure date must be after arrival date.");
  }
  // check for overlapping booking
  const overlappingTravelPlan = await TravelPlan.findOne({
    // status: { $in: ["pending", "confirmed"] },
    startDate: { $lt: new Date(endDate) },
    endDate: { $gt: new Date(startDate) },
  });

  if (overlappingTravelPlan) {
    throw new BadRequestError(
      "You already have travel plans for selected dates. Please choose different dates."
    );
  }
  // create booking if no overlapping dates
  req.body.createdBy = req.user.userId;
  const travelPlan = await TravelPlan.create(req.body);
  res.status(StatusCodes.CREATED).json({ travelPlan });
};

//UPDATE BOOKING
const updateTravelPlan = async (req, res) => {
  const {
    body: {
      destination,
      startDate,
      endDate,
      numberOfAdults,
      numberOfKids,
      interests,
      budget,
      customPreferences,
    },
    user: { userId },
    params: { id: travelPlanId },
  } = req;
  if (!destination || !startDate || !endDate || !numberOfAdults) {
    throw new BadRequestError(
      "Destination, arrival and departure dates, or number of adult travelers cannot be empty"
    );
  }
  // check if startDate less and not same as endDate
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    throw new BadRequestError("Departure date must be after arrival date.");
  }
  // checks for overlapping booking
  // const overlappingBooking = await Booking.findOne({
  //   _id: { $ne: bookingId },
  //   status: { $in: ["pending", "confirmed"] },
  //   startDate: { $lt: new Date(endDate) },
  //   endDate: { $gt: new Date(startDate) },
  // });

  // if (overlappingBooking) {
  //   throw new BadRequestError(
  //     "Selected dates are already booked. Please choose different dates."
  //   );
  // }
  // update booking if no overlapping
  const travelPlan = await TravelPlan.findByIdAndUpdate(
    { _id: travelPlanId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!travelPlan) {
    throw new NotFoundError(`No travel plan found with id: ${travelPlanId}`);
  }
  res.status(StatusCodes.OK).json({ travelPlan });
};

// DELETE travel plan
const deleteTravelPlan = async (req, res) => {
  const {
    user: { userId },
    params: { id: travelPlanId },
  } = req;
  const travelPlan = await TravelPlan.findOneAndDelete({
    _id: travelPlanId,
    createdBy: userId,
  });
  if (!travelPlan) {
    throw new NotFoundError(`No travel plan found with id: ${travelPlanId}`);
  }
  res.status(StatusCodes.OK).json({ msg: "The entry was deleted." });
};

module.exports = {
  getAllTravelPlans,
  getTravelPlan,
  createTravelPlan,
  updateTravelPlan,
  deleteTravelPlan,
};
