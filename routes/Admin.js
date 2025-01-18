const express = require('express');
const router = express.Router();
const Events = require("../models/event")
const nodemailer = require('nodemailer');
const defaultEmail = 'admin@example.com';
const defaultPassword = 'password123';
// Send email to the club
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  if (email !== defaultEmail || password !== defaultPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.status(200).json({ message: 'Login successful' });
});

router.get("/admin/events", function (req , res) { 
  Events.find({}).then(events => {
    res.json(events);
  }).catch(err => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});

router.get("/admin/requests", function (req , res) { 
  Event.find({ status: 'pending' }).then(requestEvents => {
    res.json(requestEvents);
  }).catch(err => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});

router.post("/admin/accept-event/:id", async (req, res) => {
  const eventId = req.params.id;
  try {
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    event.status = 'approved';
    await event.save();

    const mailOptions = {
      from: 'yourEmail@example.com',
      to: event.clubs[0].email,
      subject: 'Event Accepted',
      text: 'Your event has been accepted and is now live on our platform.'
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
    });

    res.status(200).json({ message: 'Event accepted and status updated to approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.delete("/admin/delete-event/:id", async (req, res) => {
  const eventId = req.params.id;
  try {
    const event = await Events.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    await event.remove();

    const mailOptions = {
      from: 'yourEmail@example.com',
      to: event.club.email,
      subject: 'Event Deleted',
      text: 'Your event has been deleted from our platform.'
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
    });

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete("/admin/delete-request/:id", async (req, res) => {
  const requestId = req.params.id;
  try {
    const request = await Events.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    await request.remove();
    const mailOptions = {
      from: 'yourEmail@example.com',
      to: request.club.email,
      subject: 'Request Deleted',
      text: 'Your event request has been deleted from our platform.'
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
    });

    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post("/admin/add-remark/:id", async (req, res) => {
  const id = req.params.id;
  const { remark } = req.body;
  try {
    const request = await Eventss.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    request.remarks.push(remark);
    await request.save();
    res.status(200).json({ message: 'Remark added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post("/admin/add-remark-to-event/:id", async (req, res) => {
  const id = req.params.id;
  const { remark } = req.body;
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    event.remarks.push(remark);
    await event.save();
    res.status(200).json({ message: 'Remark added to event successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;