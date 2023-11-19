const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose");
const app = express()
// Configure multer for file upload the logic goes here for the file upload
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "_" + uniqueSuffix + "_" + file.originalname);
  },
});
const upload = multer({ storage }).single("image");

// Route for adding a user to the database
router.post("/add", upload, async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      age: req.body.age,
      dob: req.body.dob,
      noclass: req.body.noclass,
      image: req.file.filename,
    });
    await user.save();
    req.session.message = {
      type: "success",
      message: "User added successfully",
    };
    res.redirect("/");
  } catch (err) {
    console.error("Error in /add route:", err);
    req.session.message = {
      type: "danger",
      message: "Failed to add user",
    };
    res.status(500).redirect("/");
  }
});

// Route for rendering the index page
router.get("/", async (req, res) => {
  try {
    const users = await User.find().exec(); // Fetch users from the database
    const message = req.session.message; // Retrieve the message from the session
    delete req.session.message; // Remove the message from the session

    res.render("index", {
      title: "Home Page",
      users: users, // Pass the users data to the view
      message: message, // Pass the message to the view
    });
  } catch (err) {
    console.error(err);
    req.session.message = {
      type: "danger",
      message: "Failed to fetch users",
    };
    res.redirect("/");
  }
});

// Edit a user route
router.get("/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).exec();

    if (!user) {
      return res.redirect("/");
    }

    res.render("edit_users", {
      title: "Edit User",
      user: user,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});
router.post("/update/:id", upload, async (req, res) => {
  const id = req.params.id;
  const newImage = req.file ? req.file.filename : req.body.old_image;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        age: req.body.age,
        dob: req.body.dob,
        noclass: req.body.noclass,
        image: newImage,
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    // Remove the previous image file if a new image was uploaded
    if (req.file) {
      try {
        fs.unlinkSync(`./uploads/${req.body.old_image}`);
      } catch (err) {
        console.log(err);
      }
    }
 
    req.session.message = {
      type: "success",
      message: "User updated successfully",
    };
    res.redirect("/");    
  } catch (err) {
    console.error(err);
    req.session.message = {
      type: "danger",
      message: err.message,
    };
    res.redirect("/");
  }
});
// ... (your existing routes)

// Calculate average route
router.get("/calculateAverage", async (req, res) => {
  try {
    const client = new MongoClient('mongodb://your-mongodb-connection-string', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await client.connect();
    const database = client.db('your-database-name');
    const usersCollection = database.collection('users');

    const result = await usersCollection.aggregate([
      {
        $group: {
          _id: null,
          totalClasses: { $sum: '$noclass' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          averageClasses: { $divide: ['$totalClasses', '$count'] },
        },
      },
    ]).toArray();

    const averageClasses = result[0].averageClasses;

    res.render('average', { averageClasses });
  } catch (error) {
    console.error('Error calculating average:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    client.close();
  }
});

module.exports = router;
// Calculate average classes route
// Calculate average classes route
app.get("/calculate-average", async (req, res) => {
  try {
    const User = require("C:\\presidio\\models\\users.js"); // Corrected backslashes
 // Replace with the actual path
    const users = await User.find();
    
    // Calculate the total number of teachers
    const totalTeachers = users.length;

    // Calculate average classes for each user
    users.forEach(async (user) => {
      const average = totalTeachers > 0 ? user.noclass / totalTeachers : 0;
      user.averageClasses = average;
      await user.save();
    });

    res.redirect("/"); // Redirect to the home page or user listing page
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Delete user route functionality goes here
router.get("/delete/:id", (req, res) => {
  let id = req.params.id;
  User.findOneAndDelete({ _id: id })
    .exec()
    .then((result) => {
      if (result && result.image !== "") {
        try {
          fs.unlinkSync("./uploads/" + result.image);
          console.log("Image deleted:", result.image);
        } catch (err) {
          console.log("Error deleting image:", err);
        }  
      }

      req.session.message = {
        type: "danger",
        message: "User deleted successfully",
      };

      res.redirect("/");
    })
    .catch((err) => {
      res.json({ message: err.message });
    });
});

// Route for rendering the add_users page
router.get("/add", (req, res) => {
  res.render("add_users", {
    title: "User Page",
  });
});

module.exports = router;