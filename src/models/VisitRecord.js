'use strict';

class VisitRecord {
    constructor(src) {
        this.bizName = src.biz_name;
        this.bizType = src.biz_type || null;
        this.avgCost = src.avg_cost;
        //this.latlng = src.latlng || null;
        this.distance = src.distance || null;
        this.visitCount = src.visit_count;
    }
}

module.exports = VisitRecord;
