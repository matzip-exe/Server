'use strict';

class BusinessDetail {
    constructor(src) {
        this.address = src.address || null;
        this.roadAddress = src.road_address || null;
        this.monthlyVisits = src.monthly_visits;
        this.detailUrl = src.detail_url || null;
    }
}

module.exports = BusinessDetail;
