const db = require("../config/dbConnection");
const naverSearch = require("../utils/naverSearch");

const regionList = {
    //region : table name
    jongro : "종로구",
    jung : "중구",
    yongsan : "용산구",
    
    seongdong : "성동구",
    gwangjin : "광진구",
    dongdaemoon : "동대문구",
    jungnang : "중랑구",
    seongbuk : "성북구",
    gangbuk : "강북구",
    dobong : "도봉구",
    nowon : "노원구",
    
    eunpyeong : "은평구",
    seodaemoon : "서대문구",
    mapo : "마포구",
    
    yangcheon : "양천구",
    gangseo : "강서구",
    guro:"구로구",
    geumcheon:"금천구",
    yeongdeungpo : "영등포구",
    dongjak : "동작구",
    gwanak : "관악구",
    
    seocho : "서초구",
    gangnam : "강남구",
    songpa : "송파구",
    gangdong : "강동구",
    
    seoul:'서울시'
};

const dataFilter = {
    "avg_cost" : "avg_cost",
    "visit_count" : "visit_count",
    "distance" : "visit_count"
};

const visitTableNamePrefix = "visit_records_";
const changeTableNamePrefix = "changed_names_";
const businessInfoTableName = "business_info";
const visitTableNames = Object.keys(regionList).map(i => visitTableNamePrefix + i);
const changeTableNames = Object.keys(regionList).map(i => changeTableNamePrefix + i);

exports.isDataExist = function (){
    
    return new Promise((resolve, reject) => {
        db.query(`
            SELECT relname FROM pg_class WHERE 
            relname = $1 OR relname = $2 OR relname = $3 OR relname = $4 OR relname = $5 OR relname = $6
            OR relname = $7 OR relname = $8 OR relname = $9 OR relname = $10 OR relname = $11
            OR relname = $12 OR relname = $13 OR relname = $14 OR relname = $15 OR relname = $16 OR relname = $17
            OR relname = $18 OR relname = $19 OR relname = $20 OR relname = $21 OR relname = $22 OR relname = $23
            OR relname = $24 OR relname = $25 OR relname = $26
        `, visitTableNames)
        .then(res => {
            
            let existList = res.rows.map(item => {
                return item.relname.replace(visitTableNamePrefix,"");
            });
            
            let strJSON = "";
            for(let region in regionList){
                strJSON += '"' + region + '" : '+ existList.includes(region) + ",";
            }
            strJSON = "{" + strJSON.substring(0,strJSON.length-1) + "}";
            resolve(JSON.parse(strJSON));
            
        }).catch(err => {
            setImmediate(()=>{
                reject(err);
            });
        });
    });
    
};

exports.getBizList = async function (region, userLatlng, filter, index) {

    try{
        let res = await queryBizList(region, filter, index);
        
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
                    //for items with no search result.
                    item.last_updated = getCurrentDate();
                    updateDateOfBizInfo(item); //async
                }
                
                if(searchRes) {
                    bindSearchResult(item, searchRes);
                    item.distance = getDistance(item.latlng, userLatlng);
                    item.last_updated = getCurrentDate();
                    updateBizInfoDB(item);  //async
                }
            } 
            
            let monthlyRes = await queryMonthlyVisit(region, item.biz_name);
            item.monthly_visit = monthlyRes.rows;
            return item;
        });

        res = await Promise.allSettled(res);
        /*
        res = res.reduce((resAry, item) => {
            if(item.status == 'fulfilled'){
                resAry.push(item.value);
            }
            return resAry;
        }, []);
        */
        //console.log(res);
        
        let end = Date.now();
        console.log("2 : " + (end-start));
        res.forEach(item =>{
            if(item.status == "rejected"){
                //console.log(item);
            }
        });
        
        
        //console.log(res[0].monthly_visit);
        
    } catch(e) {
        console.error("final" + e.message);
    }

};

/**
 *  To prevent SQL Injection.
 */
function verifyPrams(region, filter, index){
    /**
     * TODO : region must be in regionList.
     *      filter must be in dataFilter.
     *      members of index must be zero or positive INT.
     */
    return true;
}

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

function getDistance(bizLatlng, userLatlng) {

    const R = 6371e3; // metres
    const radLat1 = bizLatlng.lat * Math.PI/180;
    const radLat2 = userLatlng.lat * Math.PI/180;
    const radDLat = (userLatlng.lat-bizLatlng.lat) * Math.PI/180;
    const radDLng = (userLatlng.lng-bizLatlng.lng) * Math.PI/180;

    const a = Math.sin(radDLat/2) * Math.sin(radDLat/2) +
          Math.cos(radLat1) * Math.cos(radLat2) *
          Math.sin(radDLng/2) * Math.sin(radDLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c / 1000; // in KM
    return d.toFixed(1);
}

function getCurrentDate() {
    let nowDate = new Date(); 
    return nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate(); 
}

function updateBizInfoDB(item) {
    
    //update DB on business_info
    let q = `
        UPDATE business_info
        SET biz_type = $1,
            tel_num = $2,
            address = $3,
            road_address = $4,
            latlng = '( ` + item.latlng.lat + ',' + item.latlng.lng + `)',
            last_updated = $5
        WHERE biz_name = $6 AND region = $7
    `;
    
    let params = [item.biz_type, item.tel_num, item.address, 
        item.road_address, item.last_updated, item.biz_name, item.region];

    return db.query(q, params).catch(e => {throw e;});
}

function updateDateOfBizInfo(item){
    let q = `
        UPDATE business_info
        SET last_updated = $1
        WHERE biz_name = $2 AND region = $3
    `;
    
    let params = [item.last_updated, item.biz_name, item.region];
    
    return db.query(q, params).catch(e => {throw e;});
}

function updateEmpty2NULL(){
    //TODO : convert empty str into NULL
}

function queryBizList(region, filter, index) {
    
    if(!verifyPrams(region, filter, index)){
        throw new Error("Parameters are not valid.");
    }
    
    let q = `
        SELECT stats.*, 
        info.region, info.is_franchise, info.subkeyword, info.symbol, info.biz_type, info.latlng, info.last_updated
        FROM (
            SELECT biz_name, (SUM(total_cost)/SUM(num_of_people)) AS ` + dataFilter.avg_cost + `, COUNT(*) AS ` + dataFilter.visit_count + `
            FROM (
                SELECT 
                    CASE 
                    WHEN changed.changed_name IS NULL 
                    THEN visit.biz_name 
                    ELSE changed.changed_name 
                    END AS biz_name, visit.date, visit.total_cost, visit.num_of_people
                FROM visit_records_` + region + ` visit 
                LEFT OUTER JOIN changed_names_` + region + ` changed
                ON visit.biz_name = changed.origin_name
            ) corrected_record
            GROUP BY biz_name
            ORDER BY ` + dataFilter[filter] +` DESC`;
            
    if (filter != "distance")
        q += ` LIMIT ` + index.step + ` OFFSET ` + index.since;
        
    q += `) stats
    LEFT OUTER JOIN business_info info
    ON stats.biz_name = info.biz_name AND info.region = $1 
    ORDER BY ` + dataFilter[filter] + ` DESC`;

    return db.query(q, [regionList[region]]);
}

function queryMonthlyVisit(region, bizName){
    
    if(!verifyPrams(region)){
        throw new Error("Parameters are not valid.");
    }
    
    let q =`
        SELECT date, COUNT(*)
        FROM (
	        SELECT 
		        CASE 
                WHEN changed.changed_name IS NULL 
                THEN visit.biz_name 
                ELSE changed.changed_name 
                END AS biz_name, visit.date
	        FROM visit_records_` + region + ` visit 
	        LEFT OUTER JOIN changed_names_` + region + ` changed
	        ON visit.biz_name = changed.origin_name
	    ) corrected_record
	    WHERE biz_name = $1
        GROUP BY date
    `;
    
    return db.query(q, [bizName]);
}