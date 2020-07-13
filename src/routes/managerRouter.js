const express = require("express");
const manageService = require("../services/manageService");
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

router.get("/doCrawl", async (req, res, next)=>{
    /*
    const crawler = require("../utils/crawler");
    crawler.crawl({
        'region' : '동대문구',
        'biz_name' : '풍천장어와삼겹살'
    });
    */
    
    
    manageService.subSearch();
    res.end();
});


module.exports = router;