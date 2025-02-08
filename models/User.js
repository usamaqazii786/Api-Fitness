const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // You'll need this for password hashing

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please enter a valid email address'], // Email regex validation
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Enforce minimum length for password
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Hash password before saving user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash the password if it's modified
  try {
    const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (err) {
    next(err); // Pass errors to the next middleware
  }
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (err) {
    throw new Error("Password comparison failed");
  }
};

// Create and export the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
