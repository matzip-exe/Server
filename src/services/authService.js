const jwt = require("jsonwebtoken");
const KeyOfToken = 'x-access-token';

module.exports.getSignedToken = getSignedToken; 
module.exports.authenticate = authenticate; 

function getSignedToken(req, res, next){
    
    if(isValidRequest(req.headers)){
        res.status(200).json({ token:issueSignedToken() });
        
    } else {
        next(createError(403));
    }
}

function authenticate(req, res, next){
    if(req.originalUrl == process.env.AUTH_URL){
        next();
        return;
    }
    console.log(req.headers);
    
    const token = req.headers[KeyOfToken];
    if(!token) {
        next(createError(401));
        return ;
    }
    
    try {
        const decoded = jwt.verify(token, process.env.SECRET);
    } catch (error) { 
        if((error.name === "TokenExpiredError")
            && (isValidRequest(req.headers))){
            res.setHeader(KeyOfToken, issueSignedToken());
            console.log("Token is re-created!");
        } else {
            next(createError(403));
            return;
        }
    } finally {
        next();
    }
    
}

function issueSignedToken() {
    return jwt.sign(
        { 
            appName : process.env.APP_NAME
        },
        process.env.SECRET,
        {
            expiresIn : '10s',
            issuer : 'NoYes',
            subject: 'userInfo'
        }
    );
}

function isValidRequest(header){
    let rtn = false;
    
    if(header['user-agent'] === process.env.ALLOWED_AGENT){
        rtn = true;
    }
    
    return rtn;
}

function createError(code){
    let error = new Error();
    error.code = code;
    
    return error;
}