var app = require('express')();
var express = require('express')
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var User = require("./app/controllers/users.js")
var Project  = require("./app/controllers/projects.js")
var fs = require('fs');
var redirect = require('./app/middleware/redirect.js')
var client = require('./boot/redisConnection.js')
var isAuthenticated = require('./app/middleware/isAuthenticated.js')

var key = fs.readFileSync('./encryption/other/ionutKey.pem');
var cert = fs.readFileSync( './encryption/other/ionut-cert.pem' );

var options = {
key: key,
cert: cert
};

var unless = function(path, middleware) {
    return function(req, res, next) {
        if (path === req.path) {
            return next();
        } else {
            return middleware(req, res, next);
        }
    };
};

app.use(redirect);
app.use(unless("/login", isAuthenticated));




app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

app.post('/signup', function(req,res){
	console.log("in singup")
	User.signup(req,res)
})
app.post('/login', function(req,res){
	User.login(req,res, client)
})

app.post('/project', function(req,res){
	console.log("saving proj")
	Project.saveProject(req,res)
})

app.get('/projects', function(req,res){
	Project.getProjects(req,res)
})

app.get('/projects/:id', function(req,res){
	Project.getProject(req,res)
})
app.put('/projects/:id', function(req,res){
	Project.updateProject(req,res)
})
app.delete('/projects/:id', function(req,res){
	Project.deleteProject(req,res)
})

https.createServer(options, app).listen(5000,function(){
	console.log("listening for https on 5000")
});
http.createServer(app).listen(8080,function() {
	console.log("listening for http on 8080")
}
);


// openssl genrsa -out ionutKey.pem 2048
// openssl req -new -sha256 -key ionutKey.pem -out ionut-csr.pem
// openssl x509 -req -in ionut-csr.pem -signkey ionutKey.pem -out ionut-cert.pem




// redis-server



