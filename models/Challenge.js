const mongoose = require('mongoose');

// Define Challenge Schema
const challengeSchema = new mongoose.Schema({
  title: String,
  participants: Number,
  daysLeft: Number,
});

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;