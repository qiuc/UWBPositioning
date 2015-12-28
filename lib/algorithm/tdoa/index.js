/**
 * Created by chenqiu on 15/8/28.
 */

var mathTools       = require("../../mathTools");
var tdoaGetLoc      = require("./tdoaGetLoc");

module.exports = function(anchorPositions, tdoaData, zDelta, cb) {
    var rangeDiff = [];

    for(var i = 1; i < tdoaData.length; i++) {
        rangeDiff.push(mathTools.tdoaRangeDiff(
            mathTools.adjustedArriveTime(tdoaData[0].pollRXTime, tdoaData[0].timeDelta),
            mathTools.adjustedArriveTime(tdoaData[i].pollRXTime, tdoaData[i].timeDelta)
        ));
    }

    tdoaGetLoc.mode3dTaylor(rangeDiff, anchorPositions, function (err, position) {
        cb(err, position);
    });
};