const Post = require("../models/Post");

// Fetch all Community
const getCommunityPost = async (req, res) => {
    try {
      const posts = await Post.find();
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch posts' });
    }
  }

// Add a new Community
const addCommunity = async (req, res) => {
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
  };

// Update a Community
const updateCommunity = async (req, res) => {
  const { id } = req.params;
  const { name, calories, protein, carbs, fat, time } = req.body;
  try {
    const updatedCommunity = await Community.findByIdAndUpdate(
      id,
      { name, calories, protein, carbs, fat, time },
      { new: true }
    );
    if (!updatedCommunity) return res.status(404).json({ message: "Community not found" });
    res.status(200).json(updatedCommunity);
  } catch (error) {
    res.status(400).json({ message: "Error updating Community", error });
  }
};

// Delete a Community
const deleteCommunity = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCommunity = await Community.findByIdAndDelete(id);
    if (!deletedCommunity) return res.status(404).json({ message: "Community not found" });
    res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Community", error });
  }
};

module.exports = { getCommunityPost, addCommunity, updateCommunity, deleteCommunity };
