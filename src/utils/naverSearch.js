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
        var keyword = getSearchKeyword(item);

        //NAVER open api.
        let searchRes = await searchOpenApi(keyword);
        let latlng = await getLatLng(searchRes.address);
        
        searchRes.latlng = latlng;
        
        return searchRes;
    } catch(e){
        
        console.error("naverSearch.js : " + e.message);
        if(e.code == 429){
            return null;
            //do nothing - api rate limit.
        } else {
            return Promise.reject(e);
        }
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
                    reject(new Error("NAVER SEARCH - No search result with " + keyword));
                }
            
            } else {
                if(error){
                    reject(error);
                } else {
                    
                    error = new Error("NAVER SEARCH - " + response.statusCode + " error with " + keyword);
                    error.code = response.statusCode;
                    reject(error);
                }
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
                    reject(new Error("NAVER MAPS - No search result with " + address));
                }
            } else {
                if(error){
                    reject(error);
                } else {
                    
                    error = new Error("NAVER MAPS - " + response.statusCode + " error with " + address); 
                    error.code = response.statusCode;
                    reject(error);
                }
            }
        });
    });
    
}

function getSearchKeyword(item) {
    
    let keyword;
    
    if(item.region){
        keyword = item.region + ' ' + item.biz_name
        if(item.subkeyword){
            keyword += ' ' + item.subkeyword;
        } 
    } else {
        throw new Error("Invalid search item - need to delete '" + item.biz_name + "' from visit record.");
    }
    
    return keyword;
}