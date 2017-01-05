// load the things we need
var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

// define the schema for our user model
var Schema = mongoose.Schema;
var userSchema = new Schema({

  local: {
    email: {type: String, required: true},
    password: {type: String, required: true}
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  roles: {
    type: [{
      type: String,
      enum: ['user', 'admin']
    }],
    default: 'user'
  }
  
});

// methods ======================
// generating a hash
userSchema.methods.encryptPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('user', userSchema);