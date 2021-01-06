const axios = require("axios");

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
            //do nothing - api rate limit (error code 429).
            return null;
        } else {
            return Promise.reject(e);
        }
    }
};

async function searchOpenApi(keyword) {
    
    let res;
    let requestConfig = {
        method: 'get',
        url: 'https://openapi.naver.com/v1/search/local?query=' + encodeURI(keyword),
        headers: searchApiHeader
    };
    
    try {
        res = await axios(requestConfig);
    } catch(e) {
        
        let error = new Error("NAVER SEARCH - " + e.response.status + " error with " + keyword);
        error.code = e.response.status;
        throw error;
    }
    
    if(res.status == 200){
        let result = res.data.items[0];
        if(result) {
            return result;
        }
        else
            throw new Error("NAVER SEARCH - No search result with " + keyword);
    }
}

async function getLatLng(address){
    
    let res;
    let requestConfig = {
        method: 'get',
               url: 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=' + encodeURI(address),
               headers: mapsApiHeader
    };
    
    try {
        res = await axios(requestConfig);
    } catch(e) {
        
        let error = new Error("NAVER MAPS - " + e.response.status + " error with " + address); 
        error.code = e.response.status;
        throw error;
    }
    
    if(res.status == 200){
        let latlng = res.data.addresses[0];
        if(latlng) {
            return { 'x' : latlng.x, 'y' : latlng.y };
        }
        else
            throw new Error("NAVER MAPS - No search result with " + address);
    }
}

function getSearchKeyword(item) {
    
    let keyword;
    
    if(item.region){
        keyword = item.region + ' ' + item.biz_name;
        if(item.subkeyword){
            keyword += ' ' + item.subkeyword;
        } 
    } else {
        throw new Error("Invalid search item - need to delete '" + item.biz_name + "' from visit record." + item.region);
    }
    
    return keyword;
}