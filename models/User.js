const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
 name:String,
 email:String,
 profile:String,
 registered_events:[String]
}, { timestamps: true });

const Event = mongoose.model('Users', eventSchema);

module.exports = Event;
