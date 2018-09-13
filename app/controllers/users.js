  var Promise = require('bluebird')
  var bcrypt = require('bcrypt-nodejs')
  var crypto = require('crypto')
  const dbData = require('./../../dbConfig.json')
  var knex = require('knex')({
    client: 'pg',
    connection: dbData})
  var User = require('./../models/userModel.js')
  const Sequelize = require('sequelize')
  var sequelize = require('./../../boot/dbConnection.js')
  var redis = require("redis")


  const createUser = (user) => {
    const newUser = User.build({
      username: user.username,
      password_digest: user.password_digest,
      role: "user"
    })
      return newUser.save()
    .then((data) => data)
    .catch((err) => {
      console.log("err: ", err)
    })
  }

  const createToken = () => {
    console.log("creating token")
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, data) => {
        err ? reject(err) : resolve(data.toString('base64'))
      })
    })
  }

  const updateUserToken = (token, user) => {
    return knex.raw("UPDATE users SET token = ? WHERE id = ? RETURNING id, username, token", [token, user.id])
      .then((data) => data.rows[0])
  }

  const findUser = (userReq) => {
    return User.findOne({
      raw: true,
      where: {
        username: userReq.username
      }
    })
    .then((data) => data)
    .catch((err) => {
      console.log("err: ", err)
    })
  }

  const checkPassword = (reqPassword, foundUser) => {
    console.log("checking pass")
    return new Promise((resolve, reject) =>
      bcrypt.compare(reqPassword, foundUser.password_digest, (err, response) => {
          if (err) {
            console.log("errrr ", err)
            reject(err)
          }
          else if (response) {
            console.log("response ", response)
            resolve(response)
          } else {
            reject(new Error('Passwords do not match.'))
          }
      })
    )
  }

  const hashPassword = (password) => {
  return new Promise((resolve, reject) =>
    bcrypt.hash(password, bcrypt.genSaltSync(10), null, (err, hash) => {
      err ? reject(err) : resolve(hash)
    })
  )
}

const signup = (request, response) => {
  if(request.get("username") == "admin") {
      check_for_duplicate(request)
  .then(duplicate => {
    if(!duplicate) {
        const user = request.body
      hashPassword(user.password)
    .then((hashedPassword) => {
      delete user.password
      user.password_digest = hashedPassword
    })
    //.then(() => createToken())
    .then(token => user.token = token)
    .then(() => createUser(user))
    .then(user => {
      delete user.dataValues.password_digest
      resp = user.dataValues
      response.status(201).json({ resp })
    })
    }
    else {
      response.status(409).json({ "err" : "username is already being used" })
    }
  })
     }
  
  else {
    response.status(403).json({ "err" : "forbidden" })
  }
}


  const check_for_duplicate = (req) => {
    return new Promise((resolve,reject) => {
      findUser(req.body)
      .then(foundUser => {
        if(foundUser) {
          resolve(true)
        }
        else {
          resolve(false)
        }
      })
      .catch(err => {
        console.log("err: ",  err)
        reject(err)
      })
    })
  }
    

  const login = (request, response, client) => {

    var userReq = request.body
    var user = {}

    findUser(userReq)
      .then(foundUser => {
        console.log("found user: ", foundUser)
        user = foundUser

        return checkPassword(userReq.password, foundUser)
      })
      .then((res) => createToken())
      //.then(token => updateUserToken(token, user))
      .then((token) => {
        client.set(token, request.get("username"), 'EX', 300, redis.print);
        
        delete user.password_digest
        response.set("token" , token);
        response.set("username", request.get("username"));
        response.status(200).json(user)
      })
      .catch((err) => console.error(err))
  }

  module.exports = {
    signup, login
  }



/*
    console.log("in login function")

    console.log("------------------------")
    console.log("------------------------")
    console.log("------------------------")
    client.keys('*', function (err, keys) {
  if (err) return console.log(err);

  for(var i = 0, len = keys.length; i < len; i++) {
    console.log(keys[i]);
    //client.del(keys[i])
  }
});
    console.log("------------------------")
    console.log("------------------------")
    console.log("------------------------")
    

*/



