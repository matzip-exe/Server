const jwt = require("jsonwebtoken");
const jwtUtils = require("../utils/jwtUtils");
const utils = require("../utils/utils");

module.exports = authenticate;

function authenticate(req, res, next){
    if(req.originalUrl == process.env.AUTH_URL){
        next();
        return;
    }
    console.log(req.headers);
    const token = req.headers[process.env.HEADER_KEY];
    if(!token) {
        next(utils.createError(401));
        return ;
    }
    
    try {
        jwt.verify(token, process.env.SECRET);
    } catch (error) { 
        if((error.name === "TokenExpiredError")
            && (jwtUtils.isValidRequest(req.headers))){
            res.setHeader(process.env.HEADER_KEY, jwtUtils.issueSignedToken());
            console.log("Token is re-created!");
        } else {
            next(utils.createError(403));
            return;
        }
    } finally {
        next();
    }
}

