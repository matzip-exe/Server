const express = require("express");
const router = express.Router();

router.use((req, res,next)=>{
    console.log("user router");
    console.log("origin URL : " + req.originalUrl);
    console.log("origin URL : " + req.baseUrl);
    res.end();
});

module.exports = router;