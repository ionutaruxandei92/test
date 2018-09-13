const redirect = function(req, res, next) {
    if (req.secure) {
    	console.log("req method: ", req.method)
        next();
    } else {
    	const newHost = req.headers.host.replace("8080","5000")
        res.redirect(307, 'https://' + newHost + req.url);
    }
}

module.exports = redirect