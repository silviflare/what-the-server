const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
// const randonizer = require("../helpers/random");
const { randomRange } = require("../helpers/random");

const Activity = require("../models/Activity.model");
// const User = require("../models/User.model");

// POST /api/activities - Creates a new activity
router.post("/activities", (req, res, next) => {
  const {
    name,
    description,
    address,
    mapsLink,
    type,
    neighborhood,
    space,
    time,
  } = req.body;

  Activity.create({
    name,
    description,
    address,
    mapsLink,
    type,
    neighborhood,
    space,
    time,
  })
    .then((response) => res.json(response))
    .catch((err) => res.json(err));
});

// GET /api/activities - Retrieves all of the activities
router.get("/activities", (req, res, next) => {
  Activity.find()
    // .populate("user")
    .then((allActivities) => res.json(allActivities))
    .catch((err) => res.json(err));
});

// GET /api/activities/:activityId - Retrieves a specific activity by id
router.get("/activities/:activityId", (req, res) => {
  const { activityId } = req.params;

  // This could be a helper function beacuse we use it many times. Or add at the end?
  if (!mongoose.Types.ObjectId.isValid(activityId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Activity.findById(activityId)
    // .populate("user")
    .then((activity) => res.status(200).json(activity))
    .catch((err) => res.json(err));
});

// RANDOM /api/random-activity - Gets a sperandomcific activity
router.get("/random-activity", async (req, res) => {
  const { type, day } = req.params;
  try {
    const totalCountActivites = await Activity.countDocuments();
    const randomIndex = randomRange(0, totalCountActivites);

    // if(type){
    //   await Activity.findOne().skip(randomIndex);
    // }
    // console.log({ type });

    const randomActivity = await Activity.findOne().skip(randomIndex);

    res.status(200).json(randomActivity);
  } catch (err) {
    console.log("whattheerror" + err);
    res.json(err);
  }
});

// PUT /api/activities/:activityId - Updates a specific activity by id
router.put("/activities/:activityId", (req, res) => {
  const { activityId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(activityId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Activity.findByIdAndUpdate(activityId, req.body, { new: true })
    .then((updatedActivity) => res.json(updatedActivity))
    .catch((err) => res.json(err));
});

// DELETE /api/activities/:activityId - Delete a specific activity by id
router.delete("/activities/:activityId", (req, res) => {
  const { activityId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(activityId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
});

module.exports = router;
