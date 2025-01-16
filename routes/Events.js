const express = require('express');
const router = express.Router();
const Events = require("../models/event");
const cloudinary = require('cloudinary').v2;
const RequestedEvents = require('../models/RequestEvents');
const nodemailer = require('nodemailer');

const adminmail = "pinnukoushikp@gmail.com";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
  }
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
    const {
      title, description, image, date, time, venue,
      isTeamEvent, teamSize, prizeMoney, isPaid, amount, category, contactInfo,
    } = req.body;

    if (!title || !description || !image || !date || !time || !venue || isTeamEvent === undefined || !contactInfo) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // Upload image to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: 'event_images',
    });

    // Save requested event to the database
    const newEvent = new RequestedEvents({
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

    // Send email notification to the admin
    const mailOptions = {
      from: process.env.EMAIL,
      to: adminmail,
      subject: 'New Event Request Submitted',
      html: `
        <h3>New Event Request Details</h3>
        <p><b>Title:</b> ${title}</p>
        <p><b>Description:</b> ${description}</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Time:</b> ${time}</p>
        <p><b>Venue:</b> ${venue}</p>
        <p><b>Contact Info:</b> ${contactInfo}</p>
        <p><b>Image:</b> <a href="${uploadedImage.secure_url}">View Image</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: 'Event Created Successfully and Email Sent to Admin',
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

router.put('/events/:id', async (req, res) => {
  try {
    const { title, description, image, date, time, venue, isTeamEvent, teamSize, prizeMoney, isPaid, amount, category, contactInfo } = req.body;
    const event = await Events.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (title) {
      event.title = title;
    }
    if (description) {
      event.description = description;
    }
    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image, {
        folder: 'event_images',
      });
      event.imageUrl = uploadedImage.secure_url;
    }
    if (date) {
      event.date = date;
    }
    if (time) {
      event.time = time;
    }
    if (venue) {
      event.venue = venue;
    }
    if (isTeamEvent !== undefined) {
      event.isTeamEvent = isTeamEvent;
      event.teamSize = isTeamEvent ? teamSize : 1;
    }
    if (prizeMoney) {
      event.prizeMoney = prizeMoney;
    }
    if (isPaid) {
      event.isPaid = isPaid;
      event.amount = isPaid ? amount : 0;
    }
    if (category) {
      event.category = category;
    }
    if (contactInfo) {
      event.contactInfo = contactInfo;
    }

    await event.save();

    res.status(200).json({
      message: 'Event Updated Successfully',
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        imageUrl: event.imageUrl,
        date: event.date,
        time: event.time,
        venue: event.venue,
        isTeamEvent: event.isTeamEvent,
        teamSize: event.teamSize,
        prizeMoney: event.prizeMoney,
        isPaid: event.isPaid,
        amount: event.amount,
        category: event.category,
        contactInfo: event.contactInfo,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
