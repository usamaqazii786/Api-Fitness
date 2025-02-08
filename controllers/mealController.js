const Meal = require("../models/Meal");

// Fetch all meals
const getMeals = async (req, res) => {
  try {
    const meals = await Meal.find();
    res.status(200).json(meals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching meals", error });
  }
};

// Add a new meal
const addMeal = async (req, res) => {
  const { name, calories, protein, carbs, fat, time } = req.body;
  try {
    const newMeal = new Meal({ name, calories, protein, carbs, fat, time });
    await newMeal.save();
    res.status(201).json(newMeal);
  } catch (error) {
    res.status(400).json({ message: "Error adding meal", error });
  }
};

// Update a meal
const updateMeal = async (req, res) => {
  const { id } = req.params;
  const { name, calories, protein, carbs, fat, time } = req.body;
  try {
    const updatedMeal = await Meal.findByIdAndUpdate(
      id,
      { name, calories, protein, carbs, fat, time },
      { new: true }
    );
    if (!updatedMeal) return res.status(404).json({ message: "Meal not found" });
    res.status(200).json(updatedMeal);
  } catch (error) {
    res.status(400).json({ message: "Error updating meal", error });
  }
};

// Delete a meal
const deleteMeal = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedMeal = await Meal.findByIdAndDelete(id);
    if (!deletedMeal) return res.status(404).json({ message: "Meal not found" });
    res.status(200).json({ message: "Meal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting meal", error });
  }
};

module.exports = { getMeals, addMeal, updateMeal, deleteMeal };
