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
        let keyword = getSearchKeyword(item);
        console.log(keyword);
        //NAVER open api.
        let searchRes = await searchOpenApi(keyword);
        let latlng = await getLatLng(searchRes.address);
        
        searchRes.latlng = latlng;
        
        return searchRes;
    } catch(e){
        console.error(e.message);
        return Promise.reject(e);
    }
};

function searchOpenApi(keyword) {
    
    return new Promise((resolve, reject)=>{
        let config = {
           url: 'https://openapi.naver.com/v1/search/local?query=' + encodeURI(keyword),
           headers: searchApiHeader
        };
        
        request.get(config, (error, response, body)=>{
            if (!error && response.statusCode == 200) {
                
                //return only first search result.
                let res = JSON.parse(body).items[0];
                if(res){
                    resolve(res);
                } else {
                    reject(new Error("No search result - NAVER SEARCH with " + keyword));
                }
            
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
                
                let res = JSON.parse(body).addresses[0];
                if(res){
                    resolve({
                        lat : res.y,
                        lng : res.x
                    });
                } else {
                    reject(new Error("No search result - NAVER MAPS with " + address));
                }
            } else {
                reject(error);
            }
        });
    });
    
}

function getSearchKeyword(item) {
    
    let keyword;
    
    if(item.subkeyword){
        keyword = item.biz_name + ' ' + item.subkeyword;
    } else {
        if(item.region){
            keyword = item.region + ' ' + item.biz_name;
        } else {
            throw new Error("Invalid search item - need to delete '" + item.biz_name + "' from visit record.");
        }
    }
    return keyword;
}