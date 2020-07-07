const express = require("express");
const logger = require("../utils/logger");
const router = express.Router();

router.use((req, res,next)=>{
    console.log("manager router");
    console.log("origin URL : " + req.originalUrl);
    console.log("origin URL : " + req.baseUrl);
    next();
});

router.get("/getLog", async (req, res, next)=>{
    res.send(logger.readLog());
});

module.exports = router;