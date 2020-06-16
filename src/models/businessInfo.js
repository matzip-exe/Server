var BusinessInfo = function (bizName, region, is_franchaise, address, symbol) {
    this.bizName = bizName || null;
    this.region = region || null;
    this.is_franchaise = is_franchaise || null;
    this.address = address || null;
    this.symbol = symbol || null;
};

module.exports = BusinessInfo;