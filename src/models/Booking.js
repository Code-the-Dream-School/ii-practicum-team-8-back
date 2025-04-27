const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: [true, "Please provide a check-in date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please provide a check-out date"],
    },
    numberOfAdults: {
      type: Number,
      required: [true, "Please provide number of guests"],
      min: 1,
    },
    numberOfKids: {
      type: Number,
      default: 0,
    },
    numberOfGuests: {
      type: Number,
    },
    numberOfRooms: {
      type: Number,
      required: [true, "Please provide number of rooms"],
      min: 1,
    },
    numberOfNights: {
      type: Number,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "canceled", "completed"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user ID who created the Booking"],
    },
  },
  { timestamps: true }
);

BookingSchema.pre("save", function (next) {
  // calculate number of nights/stay
  if (this.startDate && this.endDate) {
    const diffTime = this.endDate - this.startDate; // in milliseconds
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // convert to days
    this.numberOfNights = diffDays;
  }

  // calculate total number of guests
  if (this.numberOfAdults != null && this.numberOfKids != null) {
    this.numberOfGuests = this.numberOfAdults + this.numberOfKids;
  }
  next();
});

module.exports = mongoose.model("Booking", BookingSchema);
