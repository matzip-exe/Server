const db = require("../config/dbConnection");

const regionList = {
    //region : table name
    jongro : "jongro",
    jung : "jung",
    yongsan : "yongsan",
    
    seongdong : "seongdong",
    gwangjin : "gwangjin",
    dongdaemoon : "dongdaemoon",
    jungnang : "jungnang",
    seongbuk : "seongbuk",
    gangbuk : "gangbuk",
    dobong : "dobong",
    nowon : "nowon",
    
    eunpyeong : "eunpyeong",
    seodaemoon : "seodaemoon",
    mapo : "mapo",
    
    yangcheon : "yangcheon",
    gangseo : "gangseo",
    guro:"guro",
    geumcheon:"geumcheon",
    yeongdeungpo : "yeongdeungpo",
    dongjak : "dongjak",
    gwanak : "gwanak",
    
    seocho : "seocho",
    gangnam : "gangnam",
    songpa : "songpa",
    gangdong : "gangdong",
    
    seoul:"seoul"
};

const visitTableNamePrefix = "visit_records_";
const changeTableNamePrefix = "changed_names_";
const businessInfoTableName = "business_info";
const visitTableNames = Object.keys(regionList).map(i => visitTableNamePrefix + regionList[i]);
const changeTableNames = Object.keys(regionList).map(i => changeTableNamePrefix + regionList[i]);

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
