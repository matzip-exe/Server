const db = require("../dao/dao");
const utils = require("../utils/utils");
const crawler = require("../utils/crawler");

exports.subSearch = async function (){
    try{
        let res = await db.selectAllFromBizInfo();
        res  = res.rows;
        for(let item of res){
            let crawler_res = await crawler.crawl(item);
            console.log('FF :');
            console.log(crawler_res);
            db.updateTelAndBizHour(crawler_res);
            
            // Set inverval
            await utils.sleep(utils.getRandomInt(3000, 9000));
        }
    } catch(e) {
        console.error(e);
    }
};