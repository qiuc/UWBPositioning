/**
 * Created by chenqiu on 15/8/30.
 */

var math        = require("./math");

module.exports = function(outp, d, p) {
    var err  = 0;
    var wIn  = 1;
    var wOut = 2;

    for(var i = 0; i < d.length; i++) {
        var xDiff = outp[0] - p[i][0];
        var yDiff = outp[1] - p[i][1];
        var distance = math.sqrt(xDiff * xDiff + yDiff * yDiff);
        if(distance <= d[i]) {
            err += wIn * math.pow(distance - d[i], 2);
        } else {
            err += wOut * math.pow(distance - d[i], 2);
        }
    }

    return err;
};