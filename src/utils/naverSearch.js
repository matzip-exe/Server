const request = require('request');
const searchApiHeader = {
    'X-Naver-Client-Id':process.env.NAVER_SEARCH_CID,
    'X-Naver-Client-Secret': process.env.NAVER_SEARCH_CPW
};

exports.search = async function(item) {
    try{
        //NAVER search open api.
        let result = await searchOpenApi(item.biz_name, item.subkeyword);
        return result;
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
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
    
}

function getLatLng(naverX, naverY){
    
    
}