/**
 * Created by chenqiu on 15/8/27.
 */
var constants       = require('./constants');
var dwtGetRangeBias = require('./dwtGetRangeBias');
var mathTools       = require("../../mathTools");

module.exports = function(chanPrf, pollTXTime, pollRXTime, rspTXTime, rspRXTime, finalTXTime, finalRXTime, zDelta, modified) {

    var distance = mathTools.tofDistance(pollTXTime, pollRXTime, rspTXTime, rspRXTime, finalTXTime, finalRXTime);

    distance -= dwtGetRangeBias(((chanPrf >> 4) & 0x0F), distance, chanPrf & 0x0F);

    // z-index modified
    if (zDelta) {
        if (distance > zDelta) {
            distance = Math.sqrt(distance * distance - zDelta * zDelta);
        } else {
            distance = 0;
        }
    }

    // parameter modified
    distance += modified;
    if(distance < 0) distance = 0;

    return distance;
};