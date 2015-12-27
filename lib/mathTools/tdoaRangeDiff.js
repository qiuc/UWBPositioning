/**
 * Created by chenqiu on 15/12/26.
 */
var math         = require("./math").parser();

module.exports = function(t1, t2) {

    math.set('t1', t1);
    math.set('t2', t2);

    math.eval('timeDiff = t2 - t1');
    math.eval('t21 = timeDiff * DWT_TIME_UNITS');
    math.eval('r21 = number(t21 * SPEED_OF_LIGHT)');

    var r21 = math.get('r21');

    math.clear();

    return r21;
};