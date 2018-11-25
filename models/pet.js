'use strict';
module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define('Pet', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    type: DataTypes.STRING,
    breed: DataTypes.STRING,
    size: DataTypes.STRING,
    sexe: DataTypes.STRING,
    photo: DataTypes.STRING,
    age: DataTypes.INTEGER
  }, {});
  Pet.associate = function(models) {
    // associations can be defined here
  };
  return Pet;
};