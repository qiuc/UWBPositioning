/**
 * Created by chenqiu on 15/8/28.
 */
var constants   = require('./constants');

module.exports = function(chan, range, prf) {
    var rangeInt25cm = Math.floor(range * 4);
    if(rangeInt25cm > 255) {
        rangeInt25cm = 255;
    }

    var cmOffsetIndex, chanIdx, i;
    if(prf === 1) {
        switch (chan) {
            case 4:
            case 7:
                chanIdx = constants.chanIdxWB[chan];
                i = 0;
                while(rangeInt25cm > constants.range25cm16PRFwb[chanIdx][i]) i++;
                cmOffsetIndex = i + constants.CM_OFFSET_16M_WB;
                break;
            default:
                chanIdx = constants.chanIdxNB[chan];
                i = 0;
                while(rangeInt25cm > constants.range25cm16PRFnb[chanIdx][i]) i++;
                cmOffsetIndex = i + constants.CM_OFFSET_16M_NB;
        }
    } else {
        switch (chan) {
            case 4:
            case 7:
                chanIdx = constants.chanIdxWB[chan];
                i = 0;
                while(rangeInt25cm > constants.range25cm64PRFwb[chanIdx][i]) i++;
                cmOffsetIndex = i + constants.CM_OFFSET_64M_WB;
                break;
            default:
                chanIdx = constants.chanIdxNB[chan];
                i = 0;
                while(rangeInt25cm > constants.range25cm64PRFnb[chanIdx][i]) i++;
                cmOffsetIndex = i + constants.CM_OFFSET_64M_NB;
        }
    }

     return cmOffsetIndex * 0.01;
};