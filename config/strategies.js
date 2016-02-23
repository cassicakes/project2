var db = require('../models');
var LocalStrategy = require('passport-local').Strategy;

module.exports = {
  serializeUser: function(user, done) {
    done(null, user.id);
  },
  deserializeUser: function(id, done) {
    db.user.findById(id).then(function(user) {
      done(null, user.get());
    }).catch(done);
  },
  localStrategy: new LocalStrategy({
    usernameField: 'email'
  }, function(email, password, done) {
    console.log('calling the auth function');
    db.user.find({where: {email: email}}).then(function(user) {
      if (user) {
        console.log("FOUND USER")
        user.checkPassword(password, function(err, result) {
          console.log(result, err)
          if (err) return done(err);
          if (result) {
            done(null, user.get());
          } else {
            console.log('invalid password/email');
            done(null, false, {message: 'Invalid email/password'});
          }
        });
      } else {
        console.log('unkown user');
        done(null, false, {message: 'Unknown user'});
      }
    });
  }),
};