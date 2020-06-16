const request = require('request');

exports.search = function(keyword, subKeyword = "") {
    let client_id = process.env.NAVER_SEARCH_CID;
    let client_secret = process.env.NAVER_SEARCH_CPW;
    
    let api_url = 'https://openapi.naver.com/v1/search/local?query=' + encodeURI(keyword + subKeyword); // json 결과
    let options = {
       url: api_url,
       headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
    
    request.get(options, function (error, response, body) {
        /**
         * Todo : parse search result
         * https://developers.naver.com/apps/#/myapps/lNZ5CDBuG5KzOnZRXmvh/playground
         * 
         */
        
        
    });
    
};

