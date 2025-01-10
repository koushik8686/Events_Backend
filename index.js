const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const Event = require('./models/event'); // Import Event model
const express = require('express');
const cors = require('cors');
dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 5000;
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors());
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Set up Cloudinary configuration using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Connect to MongoDB
mongoose.connect(process.env.URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

app.get('/', (req, res) => {
  res.send('Hello');
});

// Create event with image upload to Cloudinary
app.post('/create', async (req, res) => {
  try {
    const { title, description, image } = req.body;

    if (!image) {
      return res.status(400).send("No image provided");
    }
    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "event_images", // Optional: specify a folder for image organization
    });

    // Create event document
    const newEvent = new Event({
      title,
      description,
      imageUrl: uploadedImage.secure_url, // Store Cloudinary image URL
    });

    // Save the event to MongoDB
    await newEvent.save();

    res.json({
      message: 'Event Created Successfully',
      event: {
        title,
        description,
        imageUrl: uploadedImage.secure_url, // Image URL from Cloudinary
      },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


app.use('/auth/google' , require('./routes/GoogleAuth'))
app.use( '/', require("./routes/User"))