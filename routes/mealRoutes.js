const express = require("express");
const { getMeals, addMeal, updateMeal, deleteMeal } = require("../controllers/mealController");

const router = express.Router();

// API Routes
router.get("/", getMeals);        // Fetch all meals
router.post("/", addMeal);        // Add a new meal
router.put("/:id", updateMeal);   // Update a meal
router.delete("/:id", deleteMeal);// Delete a meal

// POST request for adding a meal
// router.post('/', async (req, res) => {
//     try {
//       const newMeal = new Meal(req.body); // Save meal to the database
//       await newMeal.save();
//       res.status(201).json(newMeal); // Send back the newly added meal
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
//   });
  
//   module.exports = router;

module.exports = router;
