/**
 * TODO: the module 'request' is deprecated.
 * Need to change the module for HTTP request.
 */
const request = require('request');
const searchApiHeader = {
    'X-Naver-Client-Id' : process.env.NAVER_SEARCH_CID,
    'X-Naver-Client-Secret': process.env.NAVER_SEARCH_CPW
};
const mapsApiHeader = {
    'X-NCP-APIGW-API-KEY-ID' : process.env.NAVER_MAPS_CID,
    'X-NCP-APIGW-API-KEY' : process.env.NAVER_MAPS_CPW
};


exports.search = async function(item) {
    try{
        //NAVER open api.
        let searchRes = await searchOpenApi(item.biz_name, item.subkeyword);
        let latlng = await getLatLng(searchRes.address);
        
        searchRes.latlng = latlng;
        
        return searchRes;
    } catch(e){
        console.error(e.message);
    }
};

function searchOpenApi(keyword, subKeyword = null) {
    
    return new Promise((resolve, reject)=>{
        if(subKeyword) keyword = keyword + " " + subKeyword;
        let config = {
           url: 'https://openapi.naver.com/v1/search/local?query=' + encodeURI(keyword),
           headers: searchApiHeader
        };
        
        request.get(config, (error, response, body)=>{
            if (!error && response.statusCode == 200) {
                
                //return only first search result.
                resolve(JSON.parse(body).items[0]);
            } else {
                reject(error);
            }
        });
    });
    
}

function getLatLng(address){
    
    return new Promise(async (resolve, reject)=>{
        let config = {
               url: 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=' + encodeURI(address),
               headers: mapsApiHeader
        };
        
        request.get(config, (error, response, body)=>{
            if (!error && response.statusCode == 200) {
                
                resolve({
                    lat : JSON.parse(body).addresses[0].x,
                    lng : JSON.parse(body).addresses[0].y
                });
            } else {
                reject(error);
            }
        });
    });
    
}