/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  passwordHashAndSalt: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
