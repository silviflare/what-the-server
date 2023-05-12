const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },
  favs: {
    type: Array,
    default: [],
  },
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
});

module.exports = model("User", userSchema);
