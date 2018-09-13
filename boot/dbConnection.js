const dbData = require('./../dbConfig.json')
const Sequelize = require('sequelize')
const sequelize = new Sequelize(dbData.db, dbData.user, dbData.password, {
  host: dbData.host,
  dialect: 'postgres',
  operatorsAliases: false,
  pool: {
    max: 50,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});

module.exports = sequelize
