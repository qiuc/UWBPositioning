/**
 * Created by chenqiu on 15/8/29.
 */
var math        = require("mathjs");

var myMath = math.create({
    matrix: 'array',
    precision: 40
});

myMath.import({
    HEX_FFFFFFFFFF  : 1099511627775,
    HEX_7FFFFFFFFF  : 549755813887,
    SPEED_OF_LIGHT: 299702547.0,
    DWT_TIME_UNITS: 1.56500400641026e-11
    //distance: function (p1, p2) {
    //    var xDiff = p1[0] - p2[0];
    //    var yDiff = p1[1] - p2[1];
    //    return math.sqrt(xDiff * xDiff + yDiff * yDiff);
    //}
});

module.exports = myMath;