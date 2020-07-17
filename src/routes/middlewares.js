var bodyParser = require("body-parser");
const authService = require("../services/authService");

module.exports = function (app){
    
    app.use(authService.authenticate);
    //add middlewares here.
    
    //middlewares for post request.
    //app.use(bodyParser.urlencoded({extended:false}));
    //app.use(bodyParser.json());
    
};