'use strict';
module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define('Pet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    // user_id: {
    //   type: DataTypes.UUID,
    //   allowNull: false
    // },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    type: DataTypes.STRING,
    breed: DataTypes.STRING,
    size: DataTypes.STRING,
    sexe: DataTypes.STRING,
    photo: DataTypes.STRING,
    age: DataTypes.INTEGER,
    altitude : DataTypes.DOUBLE,
    longitude :  DataTypes.DOUBLE

  }, {});
  Pet.associate = function(models) {
    // associations can be defined here
    Pet.belongsTo(models.User);
  };
  return Pet;
};