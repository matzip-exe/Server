const db = require("../dao/dao");
const utils = require("../utils/utils");
const crawler = require("../utils/crawler");
const naverSearch = require("../utils/naverSearch");

const schedule = require("node-schedule");

// Runs everyday at 15:01(GMT+9 00:01)
schedule.scheduleJob('00 01 15 * * *', () => {
    console.log('[Schedule] Caching is starting now.');
    exports.searchForCaching();
});

// Runs on Sunday at 17:30(GMT+9 02:30)
schedule.scheduleJob('00 30 17 * * 0', () => {
    console.log('[Schedule] Fetching Urls is starting now.');
    exports.crawlDetailUrls();
});


exports.crawlDetailUrls = async function (){
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
        console.error("managerService/crawlDetailUrls() : " + e.message);
    }
};

exports.searchForCaching  = async function () {
    try {
        let step = 5;
        let interval = 1000;
    
        let items = await db.selectAllFromBizInfo();
        items  = items.rows;
        
        for(let since=0; since<items.length-step; since+=step){
            let itemsToSearch = items.slice(since, since+step);
            
            itemsToSearch = itemsToSearch.map(async item => {
                if(utils.isOutdated(item)){
                    
                    //updates outdated data by searching with NAVER.
                    let searchRes;
                    try{
                        searchRes = await naverSearch.search(item);
                    } catch(e){
                        
                        //for items with no search result.(except for 429 error)
                        item.last_updated = utils.getCurrentDate();
                        
                        //async
                        db.updateDateOfBizInfo(item);
                    }
                    
                    if(searchRes) {
                        utils.bindSearchResult(item, searchRes);
                        item.last_updated = utils.getCurrentDate();
                        
                        //async
                        db.updateBizInfoDB(item);
                    } 
                }
                
                return item;
            });
            
            itemsToSearch = await Promise.allSettledWithFulfilled(itemsToSearch);
            //console.log(itemsToSearch);
            console.log("Searched Items(" + itemsToSearch.length + ") : ");
            for(let r of itemsToSearch) {
                console.log("searched : " + r.biz_name);
            }
            
            await utils.sleep(interval);
        }
    
    } catch(e){
        console.error("managerService/searchForCaching() : " + e.message);
    }
};