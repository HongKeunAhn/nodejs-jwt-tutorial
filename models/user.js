const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
  username: String,
  password: String,
  admin: { type: Boolean, default: false },
});

User.static.create = (username, password) => {
  const user = new this({
    username,
    password,
  });

  return user.save();
};

User.static.findOneByUsername = (username) => {
  return this.findOne({ username }).exec();
};

User.methods.verify = (password) => {
  this.admin = true;
  return this.save();
};

module.exports = mongoose.model('User', User);
