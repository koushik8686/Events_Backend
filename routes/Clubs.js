const express = require('express');
const router = express.Router();
const Clubs = require("../models/Club");
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcrypt');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

router.get('/clubs', async (req, res) => {
  try {
    const allClubs = await Clubs.find();
    res.status(200).json(allClubs);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/clubs', async (req, res) => {
  try {
    const { name, email, password, banner } = req.body;

    if (!name || !email || !password || !banner) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uploadedBanner = await cloudinary.uploader.upload(banner, {
      folder: 'club_banners',
    });

    const newClub = new Clubs({
      name,
      email,
      password: hashedPassword,
      banner_url: uploadedBanner.secure_url,
      events: [],
    });

    await newClub.save();

    res.status(201).json({
      message: 'Club Created Successfully',
      club: {
        id: newClub._id,
        name: newClub.name,
        email: newClub.email,
        banner_url: newClub.banner_url,
        events: newClub.events,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/clubs/:id', async (req, res) => {
    try {
      const club = await Clubs.findById(req.params.id);
      if (!club) {
        return res.status(404).json({ error: 'Club not found' });
      }
      res.status(200).json(club);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;
