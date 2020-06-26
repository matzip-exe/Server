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
        let result = await userService.isDataExist();
        res.status(200).json(wrapInJson(result));

    }catch (err) {
        console.error(err.message);
    }
    
});


router.get("/getBizList", async (req, res, next)=>{
    
    //test params
    let region = "dongdaemoon";
    let filter = "distance";
    let index = { since:0, step:10 };
    let userLatlng = { lat:37.250606, lng:127.077528 };
    
    if((filter == "distance") && (userLatlng == null)){
        filter  = "visit_count";
    }
    
    try{
        let bizList = await userService.getBizList(region, userLatlng, filter, index);
        res.status(200).json(wrapInJson(bizList));

    }catch (err) {
        console.error(err.message);
    }
    
});


router.get("/getBizDetail", async (req, res, next)=>{
    
    //test params
    let region = "dongdaemoon";
    let bizName = "천하복집";
     
    try{
        let bizDetails = await userService.getBizDetail(region, bizName);
        res.status(200).json(wrapInJson(bizDetails));

    }catch (err) {
        console.error(err.message);
    }
    
});

function wrapInJson(ary) {
    return { item : ary };
}

module.exports = router;