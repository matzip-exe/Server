const db = require("../config/dbConnection");
const lists = require('../config/lists');

const regionList = lists.regionList;
const dataFilter = lists.dataFilter;

const names = {
    visitTableNamePrefix : "visit_records_",
    changeTableNamePrefix : "changed_names_",
    businessInfoTableName : "business_info",
    visitTableNames : Object.keys(regionList).map(i => this.visitTableNamePrefix + i),
    changeTableNames : Object.keys(regionList).map(i => this.changeTableNamePrefix + i)
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
            ORDER BY ` + dataFilter[filter] +` DESC`;
            
    if (filter != "distance")
        q += ` LIMIT ` + index.step + ` OFFSET ` + index.since;
        
    q += `) stats
    LEFT OUTER JOIN business_info info
    ON stats.biz_name = info.biz_name AND info.region = $1 
    ORDER BY ` + dataFilter[filter] + ` DESC`;

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

exports.updateBizInfoDB = function (item) {
    
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
};

exports.updateDateOfBizInfo = function (item){
    
    let q = `
        UPDATE business_info
        SET last_updated = $1
        WHERE biz_name = $2 AND region = $3
    `;
    
    let params = [item.last_updated, item.biz_name, item.region];
    
    return db.query(q, params).catch(e => {throw e;});
};

exports.updateEmpty2NULL = function (){
    //TODO : convert empty str into NULL
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