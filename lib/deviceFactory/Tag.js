/**
 * Created by chenqiu on 15/8/26.
 */
var EventEmitter    = require("events").EventEmitter;
var Util            = require("util");

module.exports = Tag;
Util.inherits(Tag, EventEmitter);
function Tag(options) {
    EventEmitter.call(this);

    this.config = options.config;

    this._lastPacketTime = Date.now();
    this._tofCache       = new Array(256);
}

Tag.prototype.clearCache = function clearCache() {
    this._tofCache       = [];
};

Tag.prototype.cacheTofReport = function cacheTofReport(anchorId, packet) {

    var tofInfo = {
        chanPrf     : packet.chanPrf,
        pollTXTime  : packet.pollTXTime,
        pollRXTime  : packet.pollRXTime,
        rspTXTime   : packet.rspTXTime,
        rspRXTime   : packet.rspRXTime,
        finalTXTime : packet.finalTXTime,
        finalRXTime : packet.finalRXTime
    };

    if(typeof this._tofCache[packet.cycCnt] !== 'object') {
        this._tofCache[packet.cycCnt] = new Object(null);
    }

    this._tofCache[packet.cycCnt][anchorId] = tofInfo;

    //console.log("Tag ID: " + this.config.id + "cycle: " + packet.cycCnt);
    //console.log(this._tofCache[packet.cycCnt]);
};