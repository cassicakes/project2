'use strict';
module.exports = function(sequelize, DataTypes) {
  var usersEvents = sequelize.define('usersEvents', {
    userId: DataTypes.INTEGER,
    eventId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return usersEvents;
};