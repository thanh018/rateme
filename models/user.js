var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var userSchema = mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  avatar: { type: String },
  role: { type: String, default: '' },
  company: {
    name: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  passwordResetToken: { type: String, default: '' },
  passwordResetExpires: { type: Date, default: Date.now },
  facebook: { type: String, default: '' },
  tokens: Array,
});

userSchema.methods.encryptPassword = password => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

userSchema.methods.generatePasswordReset = function() {
  this.passwordResetToken = crypto.randomBytes(20).toString('hex');
  this.passwordResetExpires = Date.now() + 3600000; // expires in an hour
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
