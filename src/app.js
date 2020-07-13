const express = require("express");
const app = express();
const addMiddlewares = require("./routes/middlewares");
const addErrorhandlers = require("./routes/errorHandlers");
const userRouter = require("./routes/userRouter");
const managerRouter = require("./routes/managerRouter");

addMiddlewares(app);
app.use((req, res, next)=>{
    console.log("[app.js] origin URL : " + req.originalUrl);
    next();
});
app.use('/user', userRouter);
app.use('/manage', managerRouter);
addErrorhandlers(app);

module.exports = app;