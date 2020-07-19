module.exports = function (app){
    
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        //finish req-res cycle.
        res.status(404).json({
                success: false,
                message: "Not found."
        });
    });
    
    // error handler
    app.use(function(err, req, res, next) {
        if(err.code == 401){
            console.log("Auth Failed - " + err.code + req.originalUrl);
            res.status(err.code || 401).json({
                success: false,
                message: "Unauthorized : Access to this resource is denied."
            });
      } else {
          next(err);
      }
    });
    
    app.use(function(err, req, res, next) {
        if(err.code == 403){
            console.log("Auth Failed - " + err.code + req.originalUrl);
            res.status(err.code || 403).json({
                success: false,
                message: "Forbidden : Access to this resource is denied."
            });
      } else {
          next(err);
      }
    });
    
    app.use(function(err, req, res, next) {
        console.log("Internal Server Error - " + err.code + req.originalUrl);
        res.status(err.status || 500).json({
            success: false,
            message: "Internal Server Error : The server has been deserted for a while."
        });
    });
};
