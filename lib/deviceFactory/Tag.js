/**
 * Created by chenqiu on 15/8/26.
 */
var EventEmitter    = require("events").EventEmitter;
var Util            = require("util");
var async           = require("async");
var tof             = require("../algorithm/tof");

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
            if(tofInfo === undefined) {
                async.setImmediate(function() {
                    cb(null, "TAG_CYCLE_NO_DATA");
                });
                return;
            }

            var anchorPositionIds = Object.keys(settings.anchorPositions);
            var tofDataIds = Object.keys(tofInfo.data);

            var validIds = tofDataIds.filter(function(v){ return anchorPositionIds.indexOf(v) > -1 });
            if(validIds.length < 4) {
                if(now - tofInfo.lastPacketTime > settings.clearTimeout) {
                    tag.clearTofInfo(tofInfo.cycCnt);
                }
                async.setImmediate(function() {
                    cb(null, "TAG_CYCLE_DATA_NOT_ENOUGH");
                });
                return;
            }

            var anchorPositions = [];
            var tofData = [];
            var zDelta = settings.positionConfig.zDelta;
            validIds.forEach(function(anchorId) {
                anchorPositions.push(settings.anchorPositions[anchorId]);

                // Append modified to tofData
                var modified;
                if(anchorId.toString() in settings.positionConfig.modified) {
                    modified = settings.modified[anchorId];
                } else {
                    modified = 0;
                }
                tofInfo.data[anchorId].modified = modified;

                tofData.push(tofInfo.data[anchorId]);
            });

            var position = tof(anchorPositions, tofData, zDelta);

            tag.clearTofInfo(tofInfo.cycCnt);

            async.setImmediate(function() {
                cb(null, position);
            });
        },
        function(err, results) {
            if(err) {
                callback(err);
            } else {
                var positions = [];
                for(var i=0; i< results.length; i++) {
                    if(typeof results[i] !== 'string') {
                        positions.push(results[i]);
                    }
                }
                callback(null, positions);
            }
        }
    );
};

Tag.prototype.clearCache = function clearCache() {
    this._tofCache       = new Array(256);
};

Tag.prototype.clearTofInfo = function clearTofInfo(cycCnt) {
    this._tofCache[cycCnt] = undefined;
};

Tag.prototype.cacheTofReport = function cacheTofReport(anchorId, packet) {

    if(packet.cycCnt > 255) {
        throw new Error("cycCnt is greater than 255");
    }

    this._lastPacketTime = Date.now();

    var data = {
        chanPrf     : packet.chanPrf,
        pollTXTime  : packet.pollTXTime,
        pollRXTime  : packet.pollRXTime,
        rspTXTime   : packet.rspTXTime,
        rspRXTime   : packet.rspRXTime,
        finalTXTime : packet.finalTXTime,
        finalRXTime : packet.finalRXTime
    };

    if(this._tofCache[packet.cycCnt] === undefined) {
        this._tofCache[packet.cycCnt] = new Object(null);
        this._tofCache[packet.cycCnt].data = new Object(null);
    }

    this._tofCache[packet.cycCnt].cycCnt = packet.cycCnt;
    this._tofCache[packet.cycCnt].data[anchorId] = data;
    this._tofCache[packet.cycCnt].lastPacketTime = Date.now();
};
