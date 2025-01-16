const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String, // Example: '10:00 AM'
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
  isTeamEvent: {
    type: Boolean,
    required: true,
  },
  teamSize: {
    type: Number, // Required if `isTeamEvent` is true
    default: 1,
  },
  prizeMoney: {
    type: Number,
    default: 0, // 0 means no prize money
  },
  isPaid: {
    type: Boolean,
    default: false, // Indicates if the event is paid
  },
  amount: {
    type: Number, // Required if `isPaid` is true
    default: 0,
  },
  category: {
    type: String, // For example: 'Sports', 'Cultural', 'Technical'
    default: 'General',
  },
  contactInfo: {
    type: String, // Contact details for the event coordinator
    required: true,
  },
  remarks:[String]
}, { timestamps: true });

const RequestedEvents = mongoose.model('RequestedEvents', eventSchema);

module.exports = RequestedEvents;
