const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middlewares/jwt.middleware");

const saltRounds = 10;

//
//
// POST /auth/signup - SIGN UP
// Creates a new user in the database

router.post("/signup", (req, res) => {
  const { email, password, name } = req.body;

  // Check if email or password or name are provided as empty string
  if (email === "" || password === "" || name === "") {
    res
      .status(400)
      .json({ message: "Please provide email, password and name." });
    return;
  }

  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Please, provide a valid email address." });
    return;
  }

  // Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      return User.create({ email, password: hashedPassword, name });
    })
    .then((createdUser) => {
      const { email, name, _id } = createdUser;
      const user = { email, name, _id };

      res.status(201).json({ user: user });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

//
//
// POST /auth/login - LOGIN
// Verifies email and password and returns a JWT

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.status(400).json({ message: "Please, provide email and password." });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(400).json({ message: "This user does not exist." });
        return;
      }

      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        const { _id, email, name } = foundUser;

        const payload = { _id, email, name };
        // Create and sign the token
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user." });
      }
    })
    .catch((err) => res.status(500).json({ message: "Internal Server Error" }));
});

//
//
// GET /auth/verify - VERIFY
// Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res) => {
  res.status(200).json(req.userTokenData);
});

//
//
// GET /auth/profile - PROFILE

router.get("/profile", isAuthenticated, (req, res) => {
  const userTokenId = req.userTokenData._id;

  // This could be a helper function beacuse we use it many times. Or add at the end?
  if (!mongoose.Types.ObjectId.isValid(userTokenId)) {
    res.status(400).json({ message: "Specified profile id is not valid" });
    return;
  }

  User.findById(userTokenId)
    // .populate("activities")
    .then((user) => {
      res.status(200).json(user);
    })

    .catch((err) => res.json(err));
});

module.exports = router;
