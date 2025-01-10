const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
  name:String,
  email:String,
  password:String,
  banner_url:String,
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }] 

}, { timestamps: true });

const Clubs = mongoose.model('Clubs', ClubSchema);

module.exports = Clubs;
