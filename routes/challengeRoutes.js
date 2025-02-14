const express = require("express");
const Challenge = require("../models/Challenge");
const router = express.Router();

router.post("/:id/join", async (req, res) => {
  try {
    const { title, participants, daysLeft } = req.body;

    // Basic validation
    if (!title || !participants || !daysLeft) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create a new challenge
    const newChallenge = new Challenge({
      title,
      participants,
      daysLeft,
    });

    // Save to database
    await newChallenge.save();

    res.status(201).json(newChallenge);
  } catch (error) {
    console.error("Error creating challenge:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch challenges' });
  }
});

module.exports = router;

