const lists = require('../config/lists');

exports.getBizType = function (bizType) {
    const bizTypeList = lists.bizTypeList.normal;
    
    for(let type of bizTypeList){
        if(bizType.includes(type)){
            return type;
        }
    }
    
    return lists.bizTypeList.default;
};

exports.getDistance = function (latlng1, latlng2) {
    
    try{
        let lat1 = latlng1.lat || latlng1.y;
        let lng1 = latlng1.lng || latlng1.x;
        
        let lat2 = latlng2.lat || latlng2.y;
        let lng2 = latlng2.lng || latlng2.x;
    
        const R = 6371e3; // metres
        const radLat1 = lat1 * Math.PI/180;
        const radLat2 = lat2 * Math.PI/180;
        const radDLat = (lat2-lat1) * Math.PI/180;
        const radDLng = (lng2-lng1) * Math.PI/180;
    
        const a = Math.sin(radDLat/2) * Math.sin(radDLat/2) +
              Math.cos(radLat1) * Math.cos(radLat2) *
              Math.sin(radDLng/2) * Math.sin(radDLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c / 1000; // in KM
        
        return d.toFixed(1);
    } catch(e){
        return undefined; 
        
    }
};

exports.getCurrentDate = function () {
    let nowDate = new Date(); 
    return nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate(); 
};

exports.sleep = function (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

exports.getRandomInt = function (min, max) { 
    return Math.floor(Math.random() * (max - min)) + min;
};

exports.createError = function (code) {
    let error = new Error();
    error.code = code;
    
    return error;
};