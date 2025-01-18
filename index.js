const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const Event = require('./models/event'); // Import Event model
const express = require('express');
const cors = require('cors');
dotenv.config(); 
const app = express();
const port = 5000;
var bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
const {storage} = require('./storage/storage')
// Set up Cloudinary configuration using environment variablesconst { storage } = require('./storage/storage');
const multer = require('multer');
const upload = multer({ storage });
// Connect to MongoDB
mongoose.connect(process.env.URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

app.get('/', (req, res) => {
  res.send('Hello');
});

// Create event with image upload to Cloudinary
router.post('/create', upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;

    // Multer adds the file path automatically after successful upload
    if (!req.file) {
      return res.status(400).send("No image provided");
    }

    // Create event document
    const newEvent = new Event({
      title,
      description,
      imageUrl: req.file.path, // Cloudinary URL from Multer's response
    });

    // Save the event to MongoDB
    await newEvent.save();

    res.json({
      message: 'Event Created Successfully',
      event: {
        title: newEvent.title,
        description: newEvent.description,
        imageUrl: newEvent.imageUrl,
      },
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


app.use('/auth/google' , require('./routes/GoogleAuth'))

app.use( '/', require("./routes/User"))
app.use( '/', require("./routes/Events"))
app.use("/" , require("./routes/Admin"))
app.use("/" , require("./routes/Clubs"))