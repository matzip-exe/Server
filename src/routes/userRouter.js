const express = require("express");
const router = express.Router();

const userService = require("../services/userService");
//const staticUrl = "/user";

router.use((req, res, next)=>{
    console.log("origin URL : " + req.originalUrl);
    next();
});


router.get("/checkRegion", async (req, res, next)=>{
    
    try{
        let jsonResult = await userService.isDataExist();
        res.status(200).json(jsonResult);

    }catch (err) {
        console.error(err.message);
    }
    
});


router.get("/getBizList", async (req, res, next)=>{
    
    //test params
    let region = "seoul";
    let filter = "avg_cost";
    let index = {since:0, step:10};
    let userLatlng = {lat:37.250484 , lng:127.077548 }
    
    try{
        let jsonResult = await userService.getBizList(region, userLatlng, filter, index);
        res.status(200).json(jsonResult);

    }catch (err) {
        console.error(err.message);
    }
    
});

module.exports = router;