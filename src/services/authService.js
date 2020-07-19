const jwtUtils = require("../utils/jwtUtils");

exports.getSignedToken = function () {
    return jwtUtils.issueSignedToken();
};


