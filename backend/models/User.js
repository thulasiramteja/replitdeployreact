const { Sequelize, DataTypes } = require('sequelize');

// Correct the host definition to use the environment variable
const sequelize = new Sequelize('myappdb', 'myappuser', 'testing', {
  host: process.env.DB_HOST || 'postgres-service', // Don't wrap it in quotes
  dialect: 'postgres',
});

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
});

module.exports = { sequelize, User };
