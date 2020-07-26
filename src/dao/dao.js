const db = require("../config/dbConnection");
const lists = require('../config/lists');

const regionList = lists.regionList;
const dataFilter = lists.dataFilter;

const names = {
    visitTableNamePrefix : "visit_records_",
    changeTableNamePrefix : "changed_names_",
    businessInfoTableName : "business_info",
    get visitTableNames() { return Object.keys(regionList).map(i => this.visitTableNamePrefix + i) },
    get changeTableNames() { return Object.keys(regionList).map(i => this.changeTableNamePrefix + i) }
};
exports.names = names;

exports.queryVisitTableNameByRegion = function () {
    
    let q = `
        SELECT relname FROM pg_class WHERE 
        relname = $1 OR relname = $2 OR relname = $3 OR relname = $4 OR relname = $5 OR relname = $6
        OR relname = $7 OR relname = $8 OR relname = $9 OR relname = $10 OR relname = $11
        OR relname = $12 OR relname = $13 OR relname = $14 OR relname = $15 OR relname = $16 OR relname = $17
        OR relname = $18 OR relname = $19 OR relname = $20 OR relname = $21 OR relname = $22 OR relname = $23
        OR relname = $24 OR relname = $25 OR relname = $26
    `;
    
    return db.query(q, names.visitTableNames);
};

exports.queryBizList = function (region, filter, index) {
    
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
            ORDER BY ` + dataFilter[filter] +` DESC, biz_name ASC`;
            
    if (filter != "distance")
        q += ` LIMIT ` + index.step + ` OFFSET ` + index.since;
        
    q += `) stats
    LEFT OUTER JOIN business_info info
    ON stats.biz_name = info.biz_name AND info.region = $1
    ORDER BY ` + dataFilter[filter] + ` DESC, biz_name ASC`;

    return db.query(q, [regionList[region]]);
};

exports.queryMonthlyVisit = function (region, bizName){
    
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
};

exports.queryBizDetail = function (region, bizName){
    
    if(!verifyPrams(region)){
        throw new Error("Parameters are not valid.");
    }
    
    let q = `
        SELECT address, road_address, detail_url
        FROM business_info
        WHERE region = $1 AND biz_name = $2
    `;
    
    return db.query(q, [regionList[region], bizName]);
};

exports.selectAllFromBizInfo = function () {
    
    let q = `
        SELECT biz_name, region, subkeyword FROM business_info 
    `;
    
    return db.query(q);
};

exports.updateDetailUrl = function (item) {
    let q = `
        UPDATE business_info
        SET detail_url = $1
        WHERE biz_name = $2 AND region = $3
    `;
    
    return db.query(q, [item.detail_url, item.biz_name, item.region]).catch(e => {console.error(e.stack);});
};

exports.updateBizInfoDB = function (item) {
    
    let lat = item.latlng.lat || item.latlng.x;
    let lng = item.latlng.lng || item.latlng.y;
    
    //update DB on business_info
    let q = `
        UPDATE business_info
        SET biz_type = $1,
            address = $2,
            road_address = $3,
            latlng = '(` + lat + ',' + lng + `)',
            last_updated = $4
        WHERE biz_name = $5 AND region = $6
    `;
    
    let params = [item.biz_type, item.address, 
        item.road_address, item.last_updated, item.biz_name, item.region];

    return db.query(q, params).catch(e => {console.error(e.stack);});
};

exports.updateDateOfBizInfo = function (item){
    
    let q = `
        UPDATE business_info
        SET last_updated = $1
        WHERE biz_name = $2 AND region = $3
    `;
    
    let params = [item.last_updated, item.biz_name, item.region];
    
    return db.query(q, params).catch(e => {console.error(e.stack);});
};

exports.updateEmpty2NULL = function (){
    
    let q = `
        UPDATE business_info
        SET tel_num = null
        WHERE tel_num = '';
    `;
    
    return db.query(q).catch(e => {console.error(e.stack);});
};

/**
 *  To prevent SQL Injection.
 */
function verifyPrams(region, filter, index){
    
    let isValid = true;
    
    //'region' must be in regionList.
    if(region && !regionList.hasOwnProperty(region)){
        isValid = false;
    }
    
    //'filter' must be in dataFilter.
    if(filter && !dataFilter.hasOwnProperty(filter)){
        isValid = false;
    }
    
    //members of index must be zero or positive INT.
    if(index){
        if(isNaN(Number(index.since)) || isNaN(Number(index.step))) {
            isValid = false;
        }
    }
    
    return isValid;
}