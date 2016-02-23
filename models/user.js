'use strict';

var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.user.belongsToMany(models.event, {through: "usersEvents"});
      },
      authenticate: function(email, password, callback) {
        this.find({
          where: {email: email}
        }).then(function(user) {
          if (!user) callback(null, false);
          bcrypt.compare(password, user.password, function(err, result) {
            if (err) return callback(err);
            callback(null, result ? user : false);
          });
        }).catch(callback);
      }
    },
    instanceMethods: {
      checkPassword: function(password, callback) {
        console.log(password)
        console.log(this.password)
        if (password && this.password) {

          bcrypt.compare(password, this.password, callback);
        } else {
          callback(null, false);
        }
      }
    },
    hooks: { // hook runs before we save data to data base
      beforeCreate: function(user, options, callback) {
        if (user.password) {
          bcrypt.hash(user.password, 10, function(err, hash) {
            if (err) return callback(err); // this is just sdafety net in case bcrypt has bug. good coding practice, call back just sends err to sequelize
            user.password = hash; // this stores pw
            callback(null, user); //sequelize needs callback (run a function)
          });
        } else {
          callback(null, user);
        }
      }
    }
  });
  return user;
};