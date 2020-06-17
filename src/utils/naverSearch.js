const request = require('request');

exports.search = function(keyword, subKeyword = null) {
    let client_id = process.env.NAVER_SEARCH_CID;
    let client_secret = process.env.NAVER_SEARCH_CPW;
    
    //JSON result
    if(subKeyword) keyword = keyword + " " + subKeyword;
    let api_url = 'https://openapi.naver.com/v1/search/local?query=' + encodeURI(keyword);
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
        
        if (!error && response.statusCode == 200) {
            console.log(body);
        }
    });
    
};

