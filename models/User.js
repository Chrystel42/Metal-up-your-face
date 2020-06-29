var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');



var userSchema = mongoose.Schema({


    
     prenom: {
        type: String,
        unique: false,
        required: true
      },
      nom: {
        type: String,
        unique: true,
        required: true
      },
      password: {
        type: String,
        required: true,
      },
      statut : {
        type: Boolean,
        unique: false,
        required: true
      },
      email:{
        type: String,
        unique: true,
        required: true
      },
      role:{
        type: String,
        required: true
      },
      ville:{
        type: String
      },
      pays:{
        type: String
      },
      genre:{
        type: String
      },
      birthdate:{
        type: String
      },
      birthdateFull:{
        type: String
      },
      active :{
        type : Boolean,
        required: true

      }, 
      presentation:{
        type: String
      },
      date: {
        type: String,
        required: true
      },
      dateFull:{
        type: String,
        required: true
      },
      cheminfichier:{
        type: String,
        required: true
      },
      derniereDéco:{
        type: String
        
      },
      Typedemetal:{
        type: String
      },
      Groupes:{
        type: String
      },
      

      friends: [],
      askFriends: [],
      FriendsAsk:[]
});


userSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash){
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    })
  });

  userSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({ email: email })
      .exec(function (err, user) {
        if (err) {
          return callback(err)
        } else if (!user) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(password, user.password, function (err, result) {
          if (result === true) {
            return callback(null, user);
          } else {
            return callback();
          }
        })
      });
  }

var User = mongoose.model("User", userSchema);
module.exports = User;

