/**
 * Created by chenqiu on 15/8/22.
 */
var Anchor          = require('./Anchor');
var AnchorConfig    = require('./AnchorConfig');
var Util            = require('util');
var EventEmitter    = require("events").EventEmitter;

module.exports = AnchorCluster;

function AnchorCluster(config) {
    EventEmitter.call(this);

    config = config || {};

    this._maxNodeNumber = config.maxNodeNumber || 4;

    this._closed = false;
    this._lastId = 0;
    this._nodes = Object.create(null);
}

Util.inherits(AnchorCluster, EventEmitter);

AnchorCluster.prototype.add = function add(config) {
    if (this._closed) {
        throw new Error('AnchorCluster is closed.');
    }

    if (Object.keys(this._nodes).length === this._maxNodeNumber) {
        throw new Error('AnchorCluster is full.');
    }

    var nodeId = config.id;

    if(this._nodes[nodeId] != undefined) {
        throw new Error('Node ID "' + nodeId + '" is already defined in Anchor cluster.');
    }

    var anchorConfig = new AnchorConfig(config);

    this._nodes[nodeId] = {
        id              : nodeId,
        errorCount      : 0,
        anchor          : new Anchor({config: anchorConfig})
    }
};

AnchorCluster.prototype.remove = function remove() {

};

AnchorCluster.prototype.positioning = function positioning() {
    var nodeIds = Object.keys(this._nodes);
    if (nodeIds.length != 4) {
        throw new Error('Anchor number is must be equal to 4 when positioning in this version');
    }

    for (var i=0; i<nodeIds.length; i++) {
        var nodeId = nodeIds[i];
        var node = this._nodes[nodeId];
        this._setNodePostion(node, [0,0]);
    }
};

AnchorCluster.prototype._setNodePostion = function _removeNode(node, postion) {
    node.anchor.postion = postion;
};

AnchorCluster.prototype._getNode = function _getNode(id) {
    return this._nodes[id] || null;
};

AnchorCluster.prototype._removeNode = function _removeNode(node) {
    delete this._nodes[node.id];

    node.anchor.end(_noop);
};

function _cb(err) {
    if(err) {
        throw err;
    }
}

function _noop() {}