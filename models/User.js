const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
 name:String,
 email:String,
 profile:String,
 events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
}, { timestamps: true });

const Event = mongoose.model('Users', eventSchema);

module.exports = Event;
