'use strict';

class VisitRecord {
    constructor(src) {
        this.bizName = src.biz_name;
        this.bizType = src.biz_type || null;
        this.avgCost = src.avg_cost;
        this.distance = src.distance || null;
        this.visitCount = src.visit_count;
        this.monthlyVisits = src.monthly_visits;
    }
}

module.exports = VisitRecord;

