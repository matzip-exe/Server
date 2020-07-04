const db = require("../dao/dao");
const utils = require("../utils/utils");
const naverSearch = require("../utils/naverSearch");
const lists = require('../config/lists');

const VisitRecord = require("../models/VisitRecord");
const BusinessDetail = require("../models/BusinessDetail");

const regionList = lists.regionList;
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
                }
                
                if(searchRes) {
                    bindSearchResult(item, searchRes);
                    item.last_updated = utils.getCurrentDate();
                    
                    //async
                    db.updateBizInfoDB(item).then(() => {
                        db.updateEmpty2NULL();
                    });
                } 
            } else {
                if(item.latlng == null){
                    //items which is not outdated but invalid.
                    return Promise.reject(new Error("This item is outdated but invalid. - " + item.biz_name));
                }
            }
            
            item.distance = utils.getDistance(item.latlng, userLatlng);
            return item;
        });
        res = await Promise.allSettledWithFulfilled(res);
        
        //distance filter
        if(filter === 'distance'){
            res.sort((op1, op2) => {
               return op1.distance < op2.distance ? -1 : op1.distance > op2.distance ? 1 : 0;  
            });
            res = res.slice(index.since, index.since + index.step);
        }
        
        //query monthly visit record
        res = res.map(async item => {
            
            try{
                let monthlyRes = await db.queryMonthlyVisit(region, item.biz_name);
                item.monthly_visits = monthlyRes.rows;
            } catch(e){
                console.error(e.stack);
            }
            return new VisitRecord(item); 
        });
        res = await Promise.allSettledWithFulfilled(res);
        
        //console.log(res);
        let end = Date.now();
        console.log("Time to response : " + (end-start));
        return res;
    } catch(e) {
        console.error("userService.js/getBizList() : " + e.message);
    }

};

exports.getBizDetail = async function (region, bizName){
    
    try {
        let res = await db.queryBizDetail(region, bizName);
        
        res = res.rows.map(item => {
            return new BusinessDetail(item);
        });
        
        return res;
        
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
    bizInfo.tel_num = searchResult.telephone;
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