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
    const token = req.headers[KeyOfToken];
    
    if(!token) {
        next(createError(401));
        return ;
    }
    
    try {
        const decoded = jwt.verify(token, process.env.SECRET);
    } catch (error) { 
        if((error.message === "TokenExpiredError")
            && (isValidRequest(req.headers))){
            res.setHeader(KeyOfToken, issueSignedToken());
            next();
            
        } else {
            next(createError(403));
        }
    }
    
}

function issueSignedToken() {
    return jwt.sign(
        { 
            appName : process.env.APP_NAME
        },
        process.env.SECRET,
        {
            expiresIn : '30m',
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