const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const bodyParser = require('body-parser')
const userRoutes = require("./routes/user.js");
const serviceRoutes = require("./routes/service.js");
const locationRoutes = require("./routes/location.js");
const appointmentRoutes = require("./routes/appointment.js");
const salonRoutes = require("./routes/salon.js");
const stylistRoutes = require("./routes/stylist.js");
const commentRoutes = require("./routes/comment.js");
const registeredSalonRoutes = require("./routes/registered.js");

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({extended: true}))
dotenv.config();
mongoose.set('strictQuery', true);

const connect = () => {
  mongoose
    .connect(process.env.MONGO)
    .then(() => {
      console.log("database connnected");
    })
    .catch((err) => {
      throw err;
    });
};

app.use(express.json());
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/salons', salonRoutes);
app.use('/api/v1/stylists', stylistRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/registered', registeredSalonRoutes);

const buildPath = path.join(__dirname, "build");

// Serve the static files from the React app
app.use(express.static(buildPath));

// Catch all other routes and serve the React app's index.html file
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// Start the server
const port = process.env.PORT || 8600;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});