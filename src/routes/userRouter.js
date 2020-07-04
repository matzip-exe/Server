const express = require("express");
const router = express.Router();

const userService = require("../services/userService");
//const staticUrl = "/user";

router.use((req, res, next)=>{
    //console.log("origin URL : " + req.originalUrl);
    next();
});


router.get("/checkRegion", async (req, res, next)=>{
    
    try{
        let result = await userService.isDataExist();
        res.status(200).json(wrapInJson(result));

    }catch (err) {
        console.error(err.message);
    }
    
});


router.get("/getBizList", async (req, res, next)=>{
    
    //test params
    /*
    let region = "dongdaemoon";
    let filter = "distance";
    let index = { since:0, step:10 };
    let userLatlng = { lat:37.250606, lng:127.077528 };
    */
    
    let region = req.query.region;
    let filter = req.query.filter;
    let index = { since:req.query.since, step:req.query.step };
    let userLatlng = { lat:req.query.lat, lng:req.query.lng };
    
    if ((userLatlng.lat == null) || (userLatlng.lng == null)){
        userLatlng = null;
    }
    
    if((filter == "distance") && (userLatlng == null)) {
        filter  = "visit_count";
    }
    
    try{
        let bizList = await userService.getBizList(region, userLatlng, filter, index);
        
        console.log("origin URL : " + req.originalUrl);
        
         for(let e of bizList){
            console.log(e.bizName + e.visitCount);
        } 
        //console.log(bizList[0])
        //console.log(bizList[bizList.length-1])
        
        res.status(200).json(wrapInJson(bizList));

    }catch (err) {
        console.error(err.message);
    }
    
});


router.get("/getBizDetail", async (req, res, next)=>{
    
    //test params
    let region = req.query.region;
    let bizName = req.query.bizName;
     
    try{
        let bizDetails = await userService.getBizDetail(region, bizName);
        console.log("origin URL : " + req.originalUrl);
        
        for(let e of bizDetails){
            console.log(e.bizName);
        } 
        //console.log(bizDetails[0])
        //console.log(bizDetails[bizDetails.length-1])
        res.status(200).json(wrapInJson(bizDetails));

    }catch (err) {
        console.error(err.message);
    }
    
});

function wrapInJson(ary) {
    return { item : ary };
}

module.exports = router;