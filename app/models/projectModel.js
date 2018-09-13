var sequelize = require('./../../boot/dbConnection.js')
const Sequelize = require('sequelize')

const Project = sequelize.define('project', {
  title: {type: Sequelize.STRING, allowNull: false},
  author: {type: Sequelize.STRING, allowNull: false},
  description: {type: Sequelize.STRING, allowNull: false}
} , {underscored: true})

module.exports = Project