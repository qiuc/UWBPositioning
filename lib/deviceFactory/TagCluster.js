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

TagCluster.prototype.positioning = function positioning(config) {

};

TagCluster.prototype._getNode = function _getNode(id) {
    return this._nodes[id] || null;
};

TagCluster.prototype._removeNode = function _removeNode(node) {
    delete this._nodes[node.id];
};