const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const jwtUtils = require("../utils/jwtUtils");
const utils = require("../utils/utils");
const userService = require("../services/userService");
const authService = require("../services/authService");

router.use((req, res, next)=>{
    // do nothing
    next();
});

router.get("/auth", (req, res, next) => {
    if(jwtUtils.isValidRequest(req.headers)){
        res.status(200).json({ token : authService.getSignedToken() });
        
    } else {
        next(utils.createError(403));
    }
});

router.get("/checkRegion", async (req, res, next) => {
    
    try{
        let result = await userService.isDataExist();
        
        logger.writeLog("origin URL : " + req.originalUrl);
        logger.writeLog(JSON.stringify(result));
        logger.writeLog("================================\n\n");
        
        res.status(200).json(wrapInJson(result));

    }catch (err) {
        next(utils.createError(500));
    }
    
});


router.get("/getBizList", async (req, res, next) => {
    
    //test params
    /*
    let region = "seoul";
    let filter = "distance";
    let index = { since:0, step:200 };
    let userLatlng = { lat:37.250606, lng:127.077528 };
    */
    //let userLatlng = null;
    
    
    let region = req.query.region;
    let filter = req.query.filter;
    let index = { since:req.query.since, step:req.query.step };
    let userLatlng = { lat:req.query.lat, lng:req.query.lng };
    
    if ((userLatlng) && ((userLatlng.lat == null) || (userLatlng.lng == null))){
        userLatlng = null;
    }
    
    if((filter == "distance") && (!userLatlng)) {
        filter  = "visit_count";
    }
    
    try{
        let bizList = await userService.getBizList(region, userLatlng, filter, index);
        
        logger.writeLog("origin URL : " + req.originalUrl);
        if(bizList) {  
            for(let e of bizList){
                logger.writeLog(JSON.stringify(e));
            }
            console.log(bizList.length + " items are returned.");
        }
        logger.writeLog("================================\n\n");
        
        res.status(200).json(wrapInJson(bizList));

    }catch (err) {
        next(utils.createError(500));
    }
    
});


router.get("/getBizDetail", async (req, res, next) => {
    
    //test params
    /*
    let region = 'dongdaemoon';
    let bizName = '천하복집';
    */
    
    let region = req.query.region;
    let bizName = req.query.bizName;
    console.log(region + bizName);
    try{
        let bizDetails = await userService.getBizDetail(region, bizName);
        
        logger.writeLog("origin URL : " + req.originalUrl);
        logger.writeLog(JSON.stringify(bizDetails));
        logger.writeLog("\r\n================================\r\n\r\n");
        
        res.status(200).json(wrapInJson(bizDetails));

    }catch (err) {
        next(utils.createError(500));
    }
    
});

function wrapInJson(ary) {
    return { item : ary };
}

module.exports = router;