/**
 * Created by chenqiu on 15/8/28.
 */

var math            = require('mathjs');
var mathTools       = require("../../mathTools");
var tdoaGetLoc      = require("./tdoaGetLoc");

module.exports = function(anchorPositions, tdoaData, zDelta, cb) {
    var rangeDiff = [];

    for(var i = 1; i < tdoaData.length; i++) {
        rangeDiff.push(mathTools.tdoaRangeDiff(
            math.bignumber(tdoaData[0].pollRXTime),
            math.bignumber(tdoaData[i].pollRXTime)
        ));
    }

    tdoaGetLoc.mode3dTaylor(rangeDiff, anchorPositions, function (err, position) {
        cb(err, position);
    });
};