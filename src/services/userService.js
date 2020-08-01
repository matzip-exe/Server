const db = require("../dao/dao");
const utils = require("../utils/utils");
const crawler = require("../utils/crawler");
const naverSearch = require("../utils/naverSearch");
const lists = require('../config/lists');

const VisitRecord = require("../models/VisitRecord");
const BusinessDetail = require("../models/BusinessDetail");

const regionList = lists.regionList;
const bizTypeList = lists.bizTypeList;
const names = db.names;

exports.isDataExist = function (){
    
    return new Promise((resolve, reject) => {
        
        db.queryVisitTableNameByRegion()
        .then(res => {
            
            let existList = res.rows.map(item => {
                return item.relname.replace(names.visitTableNamePrefix,"");
            });
            
            let aryJSON = [];
            for(let region in regionList){
                aryJSON.push({
                    'region' : region ,
                    'isExist': existList.includes(region)
                });
            }
            
            resolve(aryJSON);
            
        }).catch(err => {
            setImmediate(()=>{
                reject(err);
            });
        });
    });
    
};

exports.getBizList = async function (region, userLatlng, filter, index) {
    
    try{
        let res = await db.queryBizList(region, filter, index);
        
        //improve response speed up to 90% 
        let start = Date.now();
        
        //search items asynchronously
        res = res.rows.map(async item => {
            
            if(isOutdated(item)){
                
                //updates outdated data by searching with NAVER.
                let searchRes;
                try{
                    searchRes = await naverSearch.search(item);
                } catch(e){
                    
                    //for items with no search result.(except for 429 error)
                    item.last_updated = utils.getCurrentDate();
                    db.updateDateOfBizInfo(item); //async
                    //return Promise.reject(new Error("This item is outdated but invalid. - " + item.biz_name));
                }
                
                if(searchRes) {
                    bindSearchResult(item, searchRes);
                    item.last_updated = utils.getCurrentDate();
                    
                    //async
                    db.updateBizInfoDB(item);
                } 
            }
            
            // Invalid items
            
            if(item.latlng == null){
                return Promise.reject(new Error("This item is outdated but invalid. - " + item.biz_name));
            }
            
            //it wiil be rejceted if one of params is null.
            item.distance = utils.getDistance(item.latlng, userLatlng);
            return item;
        });
        res = await Promise.allSettledWithFulfilled(res);
        
        //distance filter
        if(filter === 'distance'){
            res.sort((op1, op2) => {
               return op1.distance < op2.distance ? -1 : op1.distance > op2.distance ? 1 : op1.bizName < op2.bizName ? -1 : op1.bizName > op2.bizName ? 1 : 0;
            });
            res = res.slice(index.since, Number(index.since) + Number(index.step));
        }
        
        //create model objects
        res = res.map(item => new VisitRecord(item));
        
        let end = Date.now();
        console.log("Time to response : " + (end-start));
        
        return res;
    } catch(e) {
        console.error("userService.js/getBizList() : " + e.message);
    }

};

exports.getBizDetail = async function (region, bizName){
    
    try {
        let bizInfo = (async () => {
            let res = await db.queryBizDetail(region, bizName);
            let item = res.rows[0];
            if(!item.detail_url){
                item.detail_url = await crawler.getDetailUrl(item);
                
                // TODO: !!!UPDATE DB HERE!!!
            }
            
            // Query recommend bizs
            let bizType = utils.getBizType(item.biz_type);
            let recommendations; 
            if(bizType != bizTypeList.default){
                recommendations = (await db.queryRecommendationsByBizType(item, bizType)).rows;
            }
            
            item.recommendations = recommendations;
            return res;
        })();
        
        let bizStats = db.queryBizStats(region, bizName);
        
        let monthlyVisits = db.queryMonthlyVisit(region, bizName);
        
        let queries = await Promise.allSettledWithFulfilled([bizInfo, bizStats, monthlyVisits]);
        bizInfo = queries[0].rows[0];
        bizStats = queries[1].rows[0];
        monthlyVisits = queries[2].rows;
        
        // Bind into one object
        if(bizInfo && bizStats && monthlyVisits) {
            
            bizInfo.avg_cost = bizStats.avg_cost;
            bizInfo.visit_count = bizStats.visit_count;
            bizInfo.monthly_visits = monthlyVisits;
            
            bizInfo = new BusinessDetail(bizInfo);
        }
        console.log(bizInfo);
        return bizInfo;
        
    } catch(e){
        console.error("userService.js/getBizDetail() : " + e.message);
    }
    
};

function isOutdated(item){
    
    const dayMilis = 86400000;
    
    if(item.hasOwnProperty("last_updated")){
        if((item.last_updated == null) || (Date.now() - Date.parse(item.last_updated) > dayMilis)){
            return true;
        } 
    } 
    
    return false;
}

function bindSearchResult(bizInfo, searchResult) {
    bizInfo.biz_type = searchResult.category;
    bizInfo.address = searchResult.address;
    bizInfo.road_address = searchResult.roadAddress;
    bizInfo.latlng = searchResult.latlng;
}

Promise.allSettledWithFulfilled = async function (promises) {
    
    let results = await Promise.allSettled(promises);
    results = results.reduce((resAry, item) => {
        if(item.status == 'fulfilled'){
            resAry.push(item.value);
        }
        return resAry;
    }, []);
    return results;
};