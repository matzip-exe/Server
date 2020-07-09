const fs = require("fs");
const logFile = "log.log";

exports.readLog = function (){
    return fs.readFileSync(logFile, 'utf8');
};

exports.writeLog = function (data){
    fs.appendFileSync(logFile, data, 'utf8');
};