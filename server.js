// const http = require('http');
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
// const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const compression = require("compression");

// Import communityRoutes
const postRoutes = require("./routes/CommunityRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
// Import mealRoutes
const mealRoutes = require("./routes/mealRoutes"); // Ensure the path is correct

dotenv.config();

const app = express(); // Corrected line

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Allow both frontends
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());
app.use(compression());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dashboard-Api"; // Default URI for local MongoDB
// MongoDB Connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));
  
  // Import Routes
  const authRoutes = require("./routes/authRoutes");
  // const Post = require("./models/Post");

  // Use the mealRoutes here
app.use("/api/meals", mealRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/challenges", challengeRoutes);

// Error Handling for Routes
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

// Server
const PORT = process.env.PORT || 5001; // Default port is 5001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});