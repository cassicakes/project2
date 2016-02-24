'use strict';
module.exports = function(sequelize, DataTypes) {
  var event = sequelize.define('event', {
    name: DataTypes.STRING,
    event_id: DataTypes.STRING,
    event_url: DataTypes.STRING,
    zip_code: DataTypes.INTEGER,
    time: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.event.belongsToMany(models.user, {through: "usersEvents"});
      }
    }
  });
  return event;
};