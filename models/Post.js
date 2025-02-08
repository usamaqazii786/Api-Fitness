const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    name: { type: String, required: true },
    image: { type: String, required: true },
  },
  content: { type: String, required: true },
   likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  comments: [
    {
      user: { type: String, required: true },
      comment: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }
  ],
  time: String,
});

const PostModel = mongoose.model('Post', postSchema);
module.exports = PostModel;
