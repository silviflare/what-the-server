const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { randomRange } = require("../helpers/random");

const Activity = require("../models/Activity.model");
const User = require("../models/User.model");
const { isAuthenticated, getUser } = require("../middlewares/jwt.middleware");

// POST /api/activities - Creates a new activity
router.post("/activities", isAuthenticated, (req, res, next) => {
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

  const userId = req.userTokenData._id;

  Activity.create({
    name,
    description,
    address,
    mapsLink,
    type,
    neighborhood,
    space,
    time,
    createdBy: userId,
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
router.get("/activities/:activityId", getUser, async (req, res) => {
  const { activityId } = req.params;
  let favs = [];

  if (req.userTokenData) {
    const userToken = req.userTokenData;
    const user = await User.findById(userToken._id);
    favs = user?.favs || [];
  }

  // This could be a helper function beacuse we use it many times. Or add at the end?
  if (!mongoose.Types.ObjectId.isValid(activityId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  Activity.findById(activityId)
    // .populate("user")
    .then((activity) => {
      res
        .status(200)
        .json({ ...activity.toJSON(), isLiked: favs.includes(activityId) });
      // res.status(200).json(activity);
    })

    .catch((err) => res.json(err));
});

// RANDOM /api/random-activity - Gets a random activity
router.get("/random-activity", async (req, res) => {
  const { type, neighborhood, time, space } = req.query;

  const conditions = {};
  if (type) {
    // conditions.type = type;
    conditions.type = { $in: type };
  }
  if (neighborhood) {
    conditions.neighborhood = neighborhood;
  }
  if (time) {
    // conditions.time = time;
    conditions.time = { $in: time };
  }
  if (space) {
    conditions.space = space;
  }
  try {
    const totalCountActivites = await Activity.countDocuments(conditions);
    const randomIndex = randomRange(0, totalCountActivites);

    // if(type){
    //   await Activity.findOne().skip(randomIndex);
    // }
    // console.log({ type });

    // const randomActivity = await Activity.findOne(conditions).skip(randomIndex);
    const randomActivity = await Activity.findOne(conditions).skip(randomIndex);

    res.status(200).json(randomActivity);
  } catch (err) {
    res.json(err);
  }
});

// FILTER /api/filter - Filter activities
router.get("/filter", getUser, async (req, res) => {
  const { type, neighborhood, time, space } = req.query;

  let favs = [];

  if (req.userTokenData) {
    const userToken = req.userTokenData;
    const user = await User.findById(userToken._id);
    favs = user?.favs || [];
  }

  const conditions = {};
  if (type) {
    conditions.type = type;
  }
  if (neighborhood) {
    conditions.neighborhood = neighborhood;
  }
  if (time) {
    conditions.time = time;
  }
  if (space) {
    conditions.space = space;
  }

  // If I wanted to show just one activity
  //
  // const activity = await Activity.findOne({ type: "exhibition" });
  // const activity = await Activity.find({ type: "exhibition" });
  //
  // const activity = await Activity.findOne(conditions);
  // res.status(200).json({ activity });

  const activities = await Activity.find(conditions);
  const activtitesWithLikes = activities.map((activity) => ({
    ...activity.toJSON(),
    isLiked: favs.includes(activity._id),
  }));

  res.status(200).json(activtitesWithLikes);
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
router.delete("/activities/:activityId", async (req, res) => {
  const { activityId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(activityId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  await Activity.findByIdAndDelete(activityId);
  res.json({ success: true });
});

//
//
// FAVS

router.get("/like/:activityId", isAuthenticated, async (req, res) => {
  const { activityId } = req.params;
  const userId = req.userTokenData._id;

  const user = await User.findById(userId);

  let favs = user.favs || [];

  if (favs.includes(activityId)) {
    favs = favs.filter((fav) => fav !== activityId);
  } else {
    favs.push(activityId);
  }

  await User.findByIdAndUpdate(userId, { favs });
  res.status(200).json(favs);
});

//
//
// Get Activities from FAVS

router.get("/myFavs", isAuthenticated, async (req, res) => {
  const { activityId } = req.params;
  const userId = req.userTokenData._id;

  const user = await User.findById(userId);

  let favs = user.favs || [];

  const activities = await Activity.find({ _id: { $in: favs } });

  const activtitesWithLikes = activities.map((activity) => ({
    ...activity.toJSON(),
    isLiked: favs.includes(activity._id),
  }));

  res.status(200).json(activtitesWithLikes);
});

//
//
// Get MY Activities

router.get("/myActivities", isAuthenticated, async (req, res) => {
  const userId = req.userTokenData._id;

  const activities = await Activity.find({ createdBy: userId });

  res.status(200).json(activities);
});

module.exports = router;
