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
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
    
      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });

};
