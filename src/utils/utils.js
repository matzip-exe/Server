exports.getDistance = function (latlng1, latlng2) {
    
    let lat1 = latlng1.lat || latlng1.x;
    let lng1 = latlng1.lng || latlng1.y;
    
    let lat2 = latlng2.lat || latlng2.x;
    let lng2 = latlng2.lng || latlng2.y;

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
}

exports.getCurrentDate = function () {
    let nowDate = new Date(); 
    return nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate(); 
}