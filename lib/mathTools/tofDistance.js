/**
 * Created by chenqiu on 15/8/29.
 */
var math         = require("./math").parser();

module.exports = function(pt, pr, rt, rr, ft, fr) {

    math.set('pt', pt);
    math.set('pr', pr);
    math.set('rt', rt);
    math.set('rr', rr);
    math.set('ft', ft);
    math.set('fr', fr);

    math.eval('pollRspRTD = (rr - pt) - (rt - pr)');
    math.eval('rspFinalRTD = (fr - rt) - (ft - rr)');

    math.eval('tofi = pollRspRTD + rspFinalRTD');
    math.eval('tof = tofi * DWT_TIME_UNITS * 0.25');
    math.eval('distance = tof * SPEED_OF_LIGHT');

    var distance = math.get('distance');

    math.clear();

    return distance;
};