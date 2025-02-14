const express = require("express");
const Post = require("../models/Post");
const authenticateToken = require("../authMiddleware/authMiddleware")
const User = require("../models/User"); // Assuming you have a User model defined

const router = express.Router();


// get user
router.get('/user', authenticateToken, async (req, res) => {
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

// Create a new post
router.post("/", async (req, res) => {
  try {
    const { author, content } = req.body;

    if (!author?.name || !author?.image || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newPost = new Post({ author, content, likes: 0, comments: [], time: new Date() });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Error creating post" });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// Delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json({ message: "Post deleted", post });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
});

// Like/unlike a post
router.post("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.likes = (post.likes || 0) + 1;
    await post.save();

    res.json({ message: "Post liked", likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: "Error liking post" });
  }
});

// Add a comment
router.post("/:id/comment", async (req, res) => {
  try {
    const { comment, user } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user, comment });
    await post.save();

    res.json({ message: "Comment added", comments: post.comments });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment" });
  }
});

// Get comments for a post
router.get("/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select("comments");
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments" });
  }
});

router.delete('/:postId/comments/:commentId', async (req, res) => {
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


module.exports = router;
