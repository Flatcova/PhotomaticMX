var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt = require("bcrypt-nodejs");
var Schema = mongoose.Schema;

// define the schema for our user model
var userSchema = Schema({
  profile: {
    admin: { type: Boolean, default: true },
    local: {
      username: String,
      firstName: String,
      lastName: String,
      email: { type: String, unique: true },
      password: String,
      resetPasswordToken: String,
      resetPasswordExpires: Date
    }
  }
});

userSchema.plugin(passportLocalMongoose);

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.profile.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model("User", userSchema);
