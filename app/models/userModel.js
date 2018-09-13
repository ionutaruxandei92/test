var sequelize = require('./../../boot/dbConnection.js')
const Sequelize = require('sequelize')

const User = sequelize.define('user', {
  username: {type: Sequelize.STRING, allowNull: false},
  password_digest: {type: Sequelize.STRING, allowNull: false},
  role: {type: Sequelize.STRING, allowNull: false}
} , {underscored: true})

module.exports = User