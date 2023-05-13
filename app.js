// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

// ℹ️ Here for Material UI themes

/* import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
    palette: {
      primary: {
        main: '#ff0000', // Replace with your desired color
      },
    },
  }); */

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here

const allRoutes = require("./routes");
app.use("/api", allRoutes);

const activityRouter = require("./routes/activity.routes");
app.use("/api", activityRouter);

const authRouter = require("./routes/auth.routes");
app.use("/auth", authRouter);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
