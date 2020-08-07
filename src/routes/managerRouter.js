const express = require("express");
const manageService = require("../services/manageService");
const logger = require("../utils/logger");
const router = express.Router();

router.use((req, res,next)=>{
    // do nothing
    next();
});

router.get("/getLog", async (req, res, next)=>{
    res.send(logger.readLog());
});

router.get("/cachingImmediately", async (req, res, next)=>{
    manageService.crawlDetailUrls();
    manageService.searchForCaching();
    res.send("Caching started successfully.");
    res.end();
});


module.exports = router;