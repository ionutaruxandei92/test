var client = require('./../../boot/redisConnection.js')
var Promise = require('bluebird')
var crypto = require('crypto')
var redis = require('redis')

const createToken = () => {
    console.log("creating token")
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, data) => {
        err ? reject(err) : resolve(data.toString('base64'))
      })
    })
  }


const isAuthenticated = function(req, res, next) {
		// fac token, nu usernameul cheia pentru ca poate un user vrea sa aiba sesiuni din mai multe browsere sau de pe mai multe masini
		// la fiecare request, tokenul se refreshuieste. urmatorul request trebuie trimis cu noul token, pe care il atasez in header

	verifyUsernameAndToken(req.get("username"), req.get("token"))
	.then(result => {
		if(result) {
			console.log("working on it")
    		createToken()
    		.then(token => {
    			client.del(req.get("token"))
    			client.set(token, req.get("username"), redis.print);
    			res.set("token", token)
    			res.set("username", req.get("username"))
        		next();
    		})
    		.catch(err => {
    			console.log("err: ", err)
    		})
		}
		else {
			res.status(402).json({"err" : "you are not authenticated"})
		}
	})

}

const verifyUsernameAndToken = function(username, token) {
	return new Promise((resolve,reject) => {
		client.get(token, function(err,res){
			console.log("res: ", res)
			console.log("username ", username.trim())
			if(res.trim() == username.trim()) {
        		console.log("in true")
        		resolve(true)
        	}
        	else {
        		console.log("in false")
        		resolve(false)
        	}
		})

	})
}

module.exports = isAuthenticated