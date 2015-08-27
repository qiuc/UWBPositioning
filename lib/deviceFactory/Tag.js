/**
 * Created by chenqiu on 15/8/26.
 */
var EventEmitter    = require("events").EventEmitter;
var Util            = require("util");
var async           = require("async");

module.exports = Tag;
Util.inherits(Tag, EventEmitter);
function Tag(options) {
    EventEmitter.call(this);

    this.config = options.config;

    this._lastPacketTime = Date.now();
    this._tofCache       = new Array(256);
}

Tag.prototype.positioning = function positioning(settings, callback) {
    var now = Date.now();
    if(now - this._lastPacketTime > settings.removeTimeout) {
        callback(null, "TAG_REMOVE");
        return;
    }

    var tag = this;

    async.map(this._tofCache,
        function(tofInfo, cb) {
            if(tofInfo && tofInfo.data !== undefined && Object.keys(tofInfo.data).length >= 4) {
                //console.log("------------------------------");
                //console.log(tofInfo);
                cb(null, tofInfo.data);

                tag.clearTofInfo(tofInfo.cycCnt);
            } else {
                cb(null, "TAG_CANNOT_POSITION");
            }
        },
        function(err, results) {
            if(err) {
                callback(err);
            } else {
                var positions = [];
                for(var i=0; i< results.length; i++) {
                    if(results[i] === 'TAG_CANNOT_POSITION') {

                    } else {
                        positions.push(results[i]);
                    }
                }
                console.log('--------------------------');
                console.log(positions);
                callback(null, positions);
            }
        }
    );
};

Tag.prototype.clearCache = function clearCache() {
    this._tofCache       = [];
};

Tag.prototype.clearTofInfo = function clearTofInfo(cycCnt) {
    this._tofCache[cycCnt] = null;
}

Tag.prototype.cacheTofReport = function cacheTofReport(anchorId, packet) {

    var data = {
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
        this._tofCache[packet.cycCnt].data = new Object(null);
    }

    this._tofCache[packet.cycCnt].cycCnt = packet.cycCnt;
    this._tofCache[packet.cycCnt].data[anchorId] = data;
    this._tofCache[packet.cycCnt].lastPacketTime = Date.now();

    //console.log("Tag ID: " + this.config.id + "cycle: " + packet.cycCnt);
    //console.log(this._tofCache[packet.cycCnt]);
};
