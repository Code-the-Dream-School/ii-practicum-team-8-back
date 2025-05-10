const mongoose = require("mongoose");

const TravelPlanSchema = new mongoose.Schema(
  {
    destination: {
      type: String,
      required: [true, "Please provide a location"],
    },
    startDate: {
      type: Date,
      required: [true, "Please provide a start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please provide a end date"],
    },
    duration: {
      type: Number,
      min: 1,
    },
    numberOfAdults: {
      type: Number,
      required: [true, "Please provide number of adult travelers"],
      min: 1,
    },
    numberOfKids: {
      type: Number,
      default: 0,
    },
    numberOfTravelers: {
      type: Number,
    },
    interests: {
      type: [String],
      enum: [
        "Nature & Adventure",
        "Culture & History",
        "Leisure & Relaxation",
        "Food & Drink",
        "Entertainment & Nightlife",
        "Shopping & Urban",
        "Seasonal & Sports",
        "Well-being & Spiritual",
      ],
      default: ["Nature & Adventure", "Culture & History"],
    },
    budget: {
      type: String,
      enum: ["free", "economy", "moderate", "luxury"],
      default: "free",
    },
    customPreferences: {
      type: String,
    },
    aiGenTravelPlan: {
      type: Object,
      default: null,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user ID who created the Booking"],
    },
  },
  { timestamps: true }
);

TravelPlanSchema.pre("save", function (next) {
  // calculate number of nights/stay
  if (this.startDate && this.endDate) {
    const diffTime = this.endDate - this.startDate; // in milliseconds
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // convert to days
    this.duration = diffDays;
  }

  // calculate total number of guests
  if (this.numberOfAdults != null && this.numberOfKids != null) {
    this.numberOfTravelers = this.numberOfAdults + this.numberOfKids;
  }
  next();
});

module.exports = mongoose.model("TravelPlan", TravelPlanSchema);
