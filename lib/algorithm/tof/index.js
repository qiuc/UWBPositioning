/**
 * Created by chenqiu on 15/8/28.
 */
var calcTofDistance = require("./calcTofDistance");
var tofGetLoc       = require("./tofGetLoc");

module.exports = function(anchorPositions, tofData, zDelta) {
    var distances = tofData.map(function(item) {
        return calcTofDistance(
            item.chanPrf,
            item.pollTXTime,
            item.pollRXTime,
            item.rspTXTime,
            item.rspRXTime,
            item.finalTXTime,
            item.finalRXTime,
            zDelta,
            item.modified
        );
    });

    var pisition = tofGetLoc.mode2d4p432Last(distances, anchorPositions);

    return pisition;
};