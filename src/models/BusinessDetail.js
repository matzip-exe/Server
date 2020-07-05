'use strict';

class BusinessDetail {
    constructor(src) {
        this.telNum = src.tel_num || null;
        this.address = src.address || null;
        this.roadAddress = src.road_address || null;
        this.monthlyVisits = src.monthly_visits;
    }
}

module.exports = BusinessDetail;
