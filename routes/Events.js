const express = require('express');
const router = express.Router();
const Events = require("../models/event");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

router.get('/events', async (req, res) => {
  try {
    const allEvents = await Events.find();
    res.status(200).json(allEvents);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/events', async (req, res) => {
  try {
    const { title, description, image, date, time, venue, isTeamEvent, teamSize, prizeMoney, isPaid, amount, category, contactInfo } = req.body;

    if (!title || !description || !image || !date || !time || !venue || isTeamEvent === undefined || !contactInfo) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: 'event_images',
    });

    const newEvent = new Events({
      title,
      description,
      imageUrl: uploadedImage.secure_url,
      date,
      time,
      venue,
      isTeamEvent,
      teamSize: isTeamEvent ? teamSize : 1,
      prizeMoney: prizeMoney || 0,
      isPaid: isPaid || false,
      amount: isPaid ? amount : 0,
      category: category || 'General',
      contactInfo,
    });

    await newEvent.save();

    res.status(201).json({
      message: 'Event Created Successfully',
      event: {
        id: newEvent._id,
        title: newEvent.title,
        description: newEvent.description,
        imageUrl: newEvent.imageUrl,
        date: newEvent.date,
        time: newEvent.time,
        venue: newEvent.venue,
        isTeamEvent: newEvent.isTeamEvent,
        teamSize: newEvent.teamSize,
        prizeMoney: newEvent.prizeMoney,
        isPaid: newEvent.isPaid,
        amount: newEvent.amount,
        category: newEvent.category,
        contactInfo: newEvent.contactInfo,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
