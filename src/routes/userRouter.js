const express = require("express");
const router = express.Router();

const userService = require("../services/userService");
//const staticUrl = "/user";

router.use((req, res,next)=>{
    console.log("origin URL : " + req.originalUrl);
    next();
});

router.use("/checkRegion", async (req, res,next)=>{
    
    try{
        let jsonResult = await userService.isDataExist();
        res.status(200).json(jsonResult);

    }catch (err) {
        throw err;
    }
    
});

module.exports = router;