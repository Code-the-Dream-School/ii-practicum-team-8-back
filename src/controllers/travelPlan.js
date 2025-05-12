const TravelPlan = require("../models/TravelPlan");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const geminiClient = require("../utils/geminiClient");
const buildPrompt = require("../utils/promptBuilder");

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
  const {
    destination,
    startDate,
    endDate,
    numberOfAdults,
    numberOfKids,
    interests,
    budget,
    customPreferences,
  } = req.body;
  // check if startDate less and not same as endDate
  if (!startDate || !endDate || !destination || !numberOfAdults) {
    throw new BadRequestError(
      "Destination, arrival and departure dates, and number of adult travelers are required."
    );
  }

  // check for overlapping travel plan
  const start = new Date(startDate);
  const end = new Date(endDate);
  const { userId } = req.user;
  const overlappingTravelPlan = await TravelPlan.findOne({
    createdBy: userId, // same user only
    startDate: { $lte: end },
    endDate: { $gte: start },
  });

  if (overlappingTravelPlan) {
    throw new BadRequestError(
      "You already have travel plans for selected dates. Please choose different dates."
    );
  }
  // create travel plan if no overlapping dates
  req.body.createdBy = req.user.userId;

  // build prompt
  const promptData = {
    destination,
    startDate,
    endDate,
    numberOfAdults,
    numberOfKids,
    interests,
    budget,
    customPreferences,
  };
  const prompt = buildPrompt(promptData);

  // send to ai gemini
  let aiResponse;
  let aiTravelPlanObject;
  try {
    aiResponse = await geminiClient.generateAiTravelPlan(prompt);
    console.log("TRY", aiResponse);
    // substruct JSON from response
    const jsonStart = aiResponse.indexOf("{");
    const jsonEnd = aiResponse.lastIndexOf("}");
    const jsonString = aiResponse.substring(jsonStart, jsonEnd + 1);
    aiPlanObject = JSON.parse(jsonString);
  } catch (error) {
    console.log("CATCH", aiResponse);
    throw new BadRequestError("Failed to get response from Gemini AI.");
  }

  // save all data, including from AI API to mongodb
  const travelPlan = await TravelPlan.create({
    ...req.body,
    aiGenTravelPlan: aiPlanObject,
  });

  // send response to frontend
  res.status(StatusCodes.CREATED).json({ travelPlan });
};

//UPDATE Travel Plan
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

  // check for overlapping travel plan
  const overlappingTravelPlan = await TravelPlan.findOne({
    _id: { $ne: travelPlanId }, // excludes the travel plan being updated
    createdBy: userId, // same user only
    startDate: { $lte: end },
    endDate: { $gte: start },
  });

  if (overlappingTravelPlan) {
    throw new BadRequestError(
      "You already have travel plans for selected dates. Please choose different dates."
    );
  }

  // build prompt
  const promptData = {
    destination,
    startDate,
    endDate,
    numberOfAdults,
    numberOfKids,
    interests,
    budget,
    customPreferences,
  };
  const prompt = buildPrompt(promptData);

  // Send to Gemini
  let aiResponse;
  let aiPlanObject;
  try {
    aiResponse = await geminiClient.generateAiTravelPlan(prompt);
    const jsonStart = aiResponse.indexOf("{");
    const jsonEnd = aiResponse.lastIndexOf("}");
    const jsonString = aiResponse.substring(jsonStart, jsonEnd + 1);
    aiPlanObject = JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini AI error during update:", error.message);
    throw new BadRequestError("Failed to get AI plan during update.");
  }

  // update travel plan with new data and ai travel plan
  const updatedTravelPlan = await TravelPlan.findByIdAndUpdate(
    { _id: travelPlanId, createdBy: userId },
    {
      ...req.body,
      aiGenTravelPlan: aiPlanObject,
    },
    { new: true, runValidators: true }
  );
  if (!updatedTravelPlan) {
    throw new NotFoundError(`No travel plan found with id: ${travelPlanId}`);
  }
  res.status(StatusCodes.OK).json({ updatedTravelPlan });
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
