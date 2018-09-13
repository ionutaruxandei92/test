
var bcrypt = require('bcrypt-nodejs')
const dbData = require('./../dbConfig.json')
const Promise = require('bluebird')
var knex = require('knex')({
  client: 'pg',
  connection: {
    "host" : dbData.host,
    "user" : dbData.user,
    "password" : dbData.password,
    "database" : dbData.db
  }
});

const hashPassword = (password) => {
  return new Promise((resolve, reject) =>
    bcrypt.hash(password, bcrypt.genSaltSync(10), null, (err, hash) => {
      err ? reject(err) : resolve(hash)
    })
  )
}

var createUsersTable = function() {
  let createQuery = `CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username TEXT,
    token TEXT,
    password_digest TEXT,
    role TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
  )`;
  return new Promise((resolve,reject) => {
    return knex.raw(createQuery).then(function(result){
      resolve(result)
  })
    .catch(function(err){
      reject(err)
    })
  })
  
};

var createAdmin = function(password) {
  const query = "INSERT INTO users (username, password_digest, role) VALUES ('admin','" + password + "','administrator')"
  return new Promise((resolve,reject) => {
    return knex.raw(query)
    .then(function(result){
      resolve(result)
    })
    .catch(function(err){
      reject(err)
    })
  })
}


var createProjectsTable = function() {
  const query = `CREATE TABLE PROJECTS(
    id SERIAL PRIMARY KEY NOT NULL,
    Title TEXT,
    AUTHOR TEXT,
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
  )`;
  return new Promise((resolve,reject) => {
    return knex.raw(query)
    .then(function(result){
      resolve(result)
    })
    .catch(function(err){
      reject(err)
    })
  })
};

const createData = function() {
  const actions = []
  //(result) => 
  createUsersTable()
  .then(result => {hashPassword(dbData.adminPassword).then(hashed => {createAdmin(hashed).then((result) => {createProjectsTable().then((result) => {process.exit()})})})})
}

//const createData = function() {
//  const actions = []
//  createUsersTable()
//  .then((result) => {createAdmin().then((result) => {createProjectsTable().then((result) => {process.exit()})})})
//}

createData()





