/**
 * Created by chenqiu on 15/12/26.
 */

var math        = require("./math");
var parser      = math.parser();

module.exports = function(toaTime, deltaTime) {

    parser.set('toaTime', math.bignumber(toaTime));
    parser.set('deltaTime', math.bignumber(deltaTime));

    parser.eval('adjustedArriveTime = (toaTime - deltaTime) & HEX_FFFFFFFFFF');

    var adjustedArriveTime = parser.get('adjustedArriveTime');

    parser.clear();

    return adjustedArriveTime;
};