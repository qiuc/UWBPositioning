/**
 * Created by chenqiu on 15/8/26.
 */
var Tag             = require('./Tag');
var TagConfig       = require('./TagConfig');
var async           = require('async');
var EventEmitter    = require("events").EventEmitter;
var Util            = require("util");

module.exports = TagCluster;
Util.inherits(TagCluster, EventEmitter);
function TagCluster(options) {
    EventEmitter.call(this);

    this.config = options.config;

    this._anchorCluster = options.anchorCluster;

    this._interval = function(){};
    this._nodes = Object.create(null);
}

TagCluster.prototype._add = function (config) {
    if (Object.keys(this._nodes).length === this.config.maxNodeNumber) {
        throw new Error('TagCluster is full.');
    }

    var nodeId = config.id;

    if(this._nodes[nodeId] != undefined) {
        throw new Error('Node ID "' + nodeId + '" is already defined in Tag cluster.');
    }

    var tagConfig = new TagConfig(config);

    this._nodes[nodeId] = {
        id              : nodeId,
        errorCount      : 0,
        tag             : new Tag({config: tagConfig})
    }
};

TagCluster.prototype.processTofReport = function(anchorId, packet) {
    var nodeId = packet.tagId;
    var node = this._nodes[nodeId];
    if(node === undefined) {
        this._add({id: nodeId});
    }
    this._nodes[nodeId].tag.cacheTofReport(anchorId, packet);
};

TagCluster.prototype.removeAll = function removeAll() {
    var nodeIds = Object.keys(this._nodes);

    for (var i=0; i<nodeIds.length; i++) {
        var nodeId = nodeIds[i];
        this._removeNode(nodeId);
    }
};

TagCluster.prototype.clearCache = function clearCache() {
    var nodeIds = Object.keys(this._nodes);

    for (var i=0; i<nodeIds.length; i++) {
        var nodeId = nodeIds[i];
        var node = this._nodes[nodeId];
        node.tag.clearCache();
    }
};

TagCluster.prototype.run = function run(options, callback) {
    if(!callback && typeof options === 'function') {
        callback = options;
        options = {};
    }
    var positionInterval = options.positionInterval || 20;
    var positionConfig = {
        zDelta:     options.zDelta || 0,
        modified:   options.modified || Object.create(null)
    };

    var tagCluster = this;
    this._interval = setInterval(function() {
        tagCluster._positioning(positionConfig);
    }, positionInterval);
};

TagCluster.prototype.stop = function stop() {
    clearInterval(this._interval);
};

TagCluster.prototype._positioning = function _positioning(positionConfig) {
    var nodeIds = Object.keys(this._nodes);
    if(nodeIds.length === 0) return;

    var anchorPositions = this._anchorCluster.getPositions();
    if(Object.keys(anchorPositions).length < 4) return;

    var tagCluster = this;
    var settings = {
        processTimeout:     this.config.processTimeout,
        removeTimeout:      this.config.removeTimeout,
        anchorPositions:    anchorPositions,
        positionConfig:     positionConfig
    };

    async.map(nodeIds,
        function(id, cb) {
            var tag = tagCluster._nodes[id].tag;
            tag.positioning(settings, cb);
        },
        function(err, results) {
            if(err) {
                tagCluster.emit("error", err);
            } else {
                var positions = Object.create(null);
                for(var i=0; i< results.length; i++) {
                    if(results[i] === 'TAG_REMOVE') {
                        tagCluster._removeNode(nodeIds[i]);
                        positions[nodeIds[i]] = "TAG_REMOVE";
                    } else  if (results[i].length){
                        positions[nodeIds[i]] = results[i];
                    }
                }
                if(Object.keys(positions).length) {
                    tagCluster.emit('position', positions);
                }
            }
        }
    );
};

TagCluster.prototype._getNode = function _getNode(id) {
    return this._nodes[id] || null;
};

TagCluster.prototype._removeNode = function _removeNode(id) {
    delete this._nodes[id];
};