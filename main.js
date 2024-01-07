require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "complex-secret-key",
    resave: false,
    saveUninitialized: true,
    
  })
);

// Database connection
// Database connection
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database");
    mongoose.set('strictQuery', false); // Set strictQuery to false
  })
  .catch((error) => console.error(error));

// Set template engine
app.set("view engine", "ejs");

// Routes
const routes = require("./routes/routes");
app.use("/", routes);

// Calculate average classes route
// Calculate average classes route
app.get("/calculate-average", async (req, res) => {
  try {
    const User = require("./path/to/users.js"); // Replace with the actual path
    const users = await User.find().timeout(10000); // Add timeout here

    // Calculate the total number of teachers and sum of classes
    const totalTeachers = users.length;
    const totalClasses = users.reduce((sum, user) => sum + user.noclass, 0);
    const averageClasses = totalTeachers > 0 ? totalClasses / totalTeachers : 0;

    // Update averageClasses for all users in a single query
    await User.updateMany({}, { $set: { averageClasses: averageClasses } });

    res.redirect("/"); // Redirect to the home page or user listing page
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

// Logic for image icon
app.use(express.static("uploads"));

// Start the server
app.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}`);
});
