const { Schema, model } = require("mongoose");

const activitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: String,
  mapsLink: String,
  type: {
    type: String,
    enum: [
      "food",
      "drink",
      "exhibition",
      "party",
      "sport",
      "theater",
      "concert",
      "market",
      "tour",
      "shop",
    ],
    required: true,
  },
  neighborhood: {
    type: String,
  },
  space: {
    type: String,
    enum: ["indoor", "outdoor"],
    required: true,
  },
  time: {
    type: String,
    enum: ["morning", "afternoon", "evening", "night"],
  },
  //   owner: {
  //     type: Schema.Types.ObjectId,
  //     ref: "User",
  //   },
});

const Activity = model("Activity", activitySchema);

module.exports = Activity;
