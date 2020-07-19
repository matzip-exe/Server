var bodyParser = require("body-parser");
const authMiddleware = require("../middlewares/auth");

module.exports = function (app){
    
    app.use(authMiddleware);
    //add middlewares here.
    
    //middlewares for post request.
    //app.use(bodyParser.urlencoded({extended:false}));
    //app.use(bodyParser.json());
    
};