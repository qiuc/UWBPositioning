/**
 * Created by chenqiu on 15/8/28.
 */

var math            = require('mathjs');
var calcTofDistance = require("./calcTofDistance");
var tofGetLoc       = require("./tofGetLoc");

module.exports = function(anchorPositions, tofData, zDelta, cb) {
    var distances = tofData.map(function(item) {
        return calcTofDistance(
            item.chanPrf,
            math.bignumber(item.pollTXTime),
            math.bignumber(item.pollRXTime),
            math.bignumber(item.rspTXTime),
            math.bignumber(item.rspRXTime),
            math.bignumber(item.finalTXTime),
            math.bignumber(item.finalRXTime),
            zDelta,
            item.modified
        );
    });

    var position = tofGetLoc.mode2d4p432Last(distances, anchorPositions);

    process.nextTick(function() {
        cb(null, position);
        //callback(task._anchorCluster);
    });
};