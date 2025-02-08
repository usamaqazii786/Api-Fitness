// const http = require('http');
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
// const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const compression = require("compression");

dotenv.config();

const app = express(); // Corrected line

// Import mealRoutes
const mealRoutes = require("./routes/mealRoutes"); // Ensure the path is correct
const Challenge = require("./models/Challenge"); // Ensure the path is correct
const authenticateToken = require("./authMiddleware/authMiddleware")

// User model (add your User schema here)
const User = require("./models/User"); // Assuming you have a User model defined

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
  const Post = require("./models/Post");

// Route to create a new post
app.post('/posts', async (req, res) => {
  try {
    const { author, content } = req.body;

    // Basic validation
    if (!author || !author.name || !author.image || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newPost = new Post({ 
      author: { name: author.name, image: author.image }, 
      content, 
      likes: 0, 
      comments: [], 
      time: new Date().toLocaleString() 
    });

    await newPost.save(); 

    res.status(201).json(newPost); 
  } catch (err) {
    console.error('Error creating post:', err); 
    res.status(500).json({ error: 'Internal Server Error' }); 
  }
});

app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

app.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
});


// Like a post
app.post('/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.likes ? post.likes -= 1 : post.likes += 1;
    await post.save();

    res.json({ message: 'Post liked successfully', likes: post.likes });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/posts/:id/comment', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, user } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    //  post.comments += 1;
    post.comments.push({ user, comment: comment });
    await post.save();

    res.json({ message: 'Comment added successfully', comments: post.comments });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const post = await Post.findById(id).select("comments");
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post.comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/posts/:postId/comments/:commentId', async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Filter out the comment to delete
    post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);

    // Save the updated post
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully", comments: post.comments });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.post('/posts/:id/share', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.shares += 1;
    await post.save();

    res.json({ message: 'Post shared successfully', shares: post.shares });
  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post("/challenges/:id/join", async (req, res) => {
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

app.get('/challenges', async (req, res) => {
  try {
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch challenges' });
  }
});

// Protected route to fetch user data (requires jwt)
app.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Extract the user ID from the decoded token
    const user = await User.findById(userId).select("/asset/exercises.jpg"); // Adjust fields as necessary

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Use the mealRoutes here
app.use("/api/meals", mealRoutes);
app.use("/api/auth", authRoutes);

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