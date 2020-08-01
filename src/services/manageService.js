const db = require("../dao/dao");
const utils = require("../utils/utils");
const crawler = require("../utils/crawler");

exports.subSearch = async function (){
    try{
        let res = await db.selectAllFromBizInfo();
        res  = res.rows;
        for(let item of res){
            let detail_url = await crawler.getDetailUrl(item);
            item.detail_url = detail_url;
            console.log(item);
            db.updateDetailUrl(item);
            
            // Set inverval
            await utils.sleep(utils.getRandomInt(3000, 9000));
        }
    } catch(e) {
        console.error(e);
    }
};