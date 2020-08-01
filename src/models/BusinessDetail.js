'use strict';

class BusinessDetail {
    constructor(src) {
        this.monthlyVisits = src.monthly_visits;
        this.avgCost = src.avg_cost;
        this.latlng = src.latlng || null;
        this.detailUrl = src.detail_url || null;
        this.visitCount = src.visit_count;
        this.recommendations = src.recommendations  || []; 
    }
}

module.exports = BusinessDetail;
