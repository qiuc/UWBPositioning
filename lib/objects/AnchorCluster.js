/**
 * Created by chenqiu on 15/8/22.
 */
var Anchor          = require('./Anchor');
var AnchorConfig    = require('./AnchorConfig');
var async           = require('async');
var Util            = require('util');
var EventEmitter    = require("events").EventEmitter;

module.exports = AnchorCluster;

function AnchorCluster(config) {
    EventEmitter.call(this);

    config = config || {};

    this._maxNodeNumber = config.maxNodeNumber || 4;
    this._maxRetryTimes = config.maxRetryTimes || 10;

    this._initPosition  = config.initPosition || [0, 0];
    this._initAngle     = config.initAngle || 0;
    this._isMirror      = typeof config.isMirror === 'undefined' ? false : config.isMirror;

    this._closed = false;
    this._nodes = Object.create(null);
}

Util.inherits(AnchorCluster, EventEmitter);

AnchorCluster.prototype.changeConfig = function changeConfig(config) {
    config = config || {};

    this._maxNodeNumber = config.maxNodeNumber || 4;
    this._maxRetryTimes = config.maxRetryTimes || 10;

    this._initPosition  = config.initPosition || [0, 0];
    this._initAngle     = config.initAngle || 0;
    this._isMirror      = typeof config.isMirror === 'undefined' ? false : config.isMirror;

    this.clearPosition();
};

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

AnchorCluster.prototype.clearPosition = function clearPosition() {
    var nodeIds = Object.keys(nodes);

    for (var i=0; i<nodeIds.length; i++) {
        var nodeId = nodeIds[i];
        var node = this._nodes[nodeId];
        node.anchor.clearPosition();
    }
};

AnchorCluster.prototype.positioning = function positioning() {
    var nodes = this._nodes;
    var nodeIds = Object.keys(nodes);
    var positions = {};
    var settings = {
        initPosition:   this._initPosition,
        initAngle:      this._initAngle,
        isMirror:       this._isMirror
    };
    if (nodeIds.length != 4) {
        throw new Error('Anchor number is must be equal to 4 when positioning in this version');
    }

    async.retry(this._maxRetryTimes,
        function(cb) {
            async.reduce(nodeIds, positions, function(memo, nodeId, cb) {
                var node = nodes[nodeId];
                positions = node.anchor.positioning(positions, settings);
                cb(null, positions);
            }, function(err, result){
                if(Object.keys(result).length < nodeIds.length) {
                    cb("Not all anchors positioning complete.", result);
                } else {
                    cb(null, result);
                }
            })
        }, function(err, result) {
            if(err) {
                console.log(err);
                console.log("Anchors Position:");
                console.log(result);
            }
        }
    );
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