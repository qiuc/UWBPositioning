/**
 * Created by chenqiu on 15/8/30.
 */

var math        = require("./math");

module.exports = function(outp, d, p) {
    var err  = 0;
    var wIn  = 1;
    var wOut = 2;

    for(var i = 0; i < d.length; i++) {
        if(math.distance(outp, p[i]) <= d[i]) {
            err += wIn * math.pow(math.distance(outp, p[i]) - d[i], 2);
        } else {
            err += wOut * math.pow(math.distance(outp, p[i]) - d[i], 2);
        }
    }

    return err;
};