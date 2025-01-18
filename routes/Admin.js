const express = require('express');
const router = express.Router();
const Events = require("../models/event")
const Requests = require("../models/RequestEvents")
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const SECRET_KEY = process.env.JWT_SECRET;
const emailUser = process.env.EMAIL;
const emailPassword = process.env.EMAIL_PASSWORD;

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPassword
    }
});

// Admin login route
router.post("/admin/login", async (req, res) => {
    const { email, password } = req.body;
    if (email !== adminEmail || password !== adminPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ email, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
});

// Fetch all events
router.get("/admin/events", (req, res) => {
    Events.find({}).then(events => {
        res.json(events);
    }).catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.get("/admin/requests", function (req , res) { 
  Requests.find({}).then(requestEvents => {
    res.json(requestEvents);
  }).catch(err => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});

// Accept event request
router.post("/admin/accept-event/:id", async (req, res) => {
  const eventId = req.params.id;
  try {
    const event = await Requests.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const newEvent = new Events(event);
    await newEvent.save();
    await event.remove();
    const mailOptions = {
      from: 'yourEmail@example.com',
      to: event.club.email,
      subject: 'Event Accepted',
      text: 'Your event has been accepted and is now live on our platform.'
    };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    res.status(200).json({ message: 'Event accepted successfully' });
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
            from: emailUser,
            to: event.club.email,
            subject: 'Event Deleted',
            text: 'Your event has been deleted from our platform.'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete request
router.delete("/admin/delete-request/:id", async (req, res) => {
  const requestId = req.params.id;
  try {
    const request = await Requests.findById(requestId);
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

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add remark to request
router.post("/admin/add-remark/:id", async (req, res) => {
  const id = req.params.id;
  const { remark } = req.body;
  try {
    const request = await Requests.findById(id);
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

// Add remark to event
router.post("/admin/add-remark-to-event/:id", async (req, res) => {
    const id = req.params.id;
    const { remark } = req.body;
    try {
        const event = await Events.findById(id);
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

module.exports = router;