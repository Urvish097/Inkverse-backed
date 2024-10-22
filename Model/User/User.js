const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSChema = new Schema({
  fname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  profile: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Block'],
    default: 'Pending',
    required: true
  },
  role: {
    type: String,
    default: "User",
  },
}, { timestamps: true });

const User = mongoose.model("User", UserSChema);

module.exports = User;