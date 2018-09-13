var redis = require('redis')
var client = redis.createClient("6379","localhost");

client.on("connect", function (err) {
    console.log("Connected to redis");
});
client.on("error", function (err) {
    console.log("Error " + err);
});

module.exports = client