const mongoose = require('mongoose');

const Dog = new mongoose.Schema({
  name: String,
  imageUrl: String,
  rating: Number,
  comments: [ String ],
});

module.exports = mongoose.model('Dog', Dog);
