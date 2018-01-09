const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  dogs: [{
    name: String,
    imageUrl: String,
    gender: String,
    birthday: Date,
  }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
