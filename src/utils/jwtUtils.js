const jwt = require("jsonwebtoken");

exports.isValidRequest = function (header) {
    let rtn = false;
    
    if(header[process.env.ALLOWED_FIELD] === process.env.ALLOWED_AGENT){
        rtn = true;
    }
    
    return rtn;
};

exports.issueSignedToken = function () {
    return jwt.sign(
        { 
            appName : process.env.APP_NAME
        },
        process.env.SECRET,
        {
            expiresIn : process.env.TOKEN_EXPIRE,
            issuer : process.env.TOKEN_ISSUER,
            subject: process.env.TOKEN_SUBJECT
        }
    );
};