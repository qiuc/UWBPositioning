/**
 * Created by chenqiu on 15/8/22.
 */
var Anchor          = require('./Anchor');
var AnchorConfig    = require('./AnchorConfig');
var async           = require('async');
var Util            = require('util');
var EventEmitter    = require("events").EventEmitter;

module.exports = AnchorCluster;

function AnchorCluster(options) {
    EventEmitter.call(this);

    this.config = options.config;

    this._nodes = Object.create(null);
}

Util.inherits(AnchorCluster, EventEmitter);

AnchorCluster.prototype.add = function add(config) {
    if (Object.keys(this._nodes).length === this.config.maxNodeNumber) {
        throw new Error('AnchorCluster is full.');
    }

    var nodeId = config.id;

    if(this._nodes[nodeId] != undefined) {
        var err = Error('Node ID "' + nodeId + '" is already defined in Anchor cluster.');
        err.code = "ANCHORCLUSTER_ANCHOR_ID_EXISTS";
        throw new err;
    }

    var anchorConfig = new AnchorConfig(config);

    this._nodes[nodeId] = {
        id              : nodeId,
        errorCount      : 0,
        anchor          : new Anchor({config: anchorConfig})
    }
};

AnchorCluster.prototype.setDistances = function(nodeId, distances) {
    this._nodes[nodeId].anchor.setDistances(distances);
};

AnchorCluster.prototype.removeAll = function removeAll() {
    var nodeIds = Object.keys(this._nodes);

    for (var i=0; i<nodeIds.length; i++) {
        var nodeId = nodeIds[i];
        this._removeNode(nodeId);
    }
};

AnchorCluster.prototype.clearPosition = function clearPosition() {
    var nodeIds = Object.keys(this._nodes);

    for (var i=0; i<nodeIds.length; i++) {
        var nodeId = nodeIds[i];
        var node = this._nodes[nodeId];
        node.anchor.clearPosition();
    }
};

AnchorCluster.prototype.positioning = function positioning(config) {
    var nodes = this._nodes;
    var nodeIds = Object.keys(nodes);
    var positions = {};

    var settings = {
        initPosition:   config.initPosition || [0, 0],
        initAngle:      config.initAngle || 0,
        isMirror:       typeof config.isMirror === 'undefined' ? false : config.isMirror
    };

    if (nodeIds.length != 4) {
        throw new Error('Anchor number is must be equal to 4 when positioning in this version');
    }

    var AnchorCluster = this;

    async.retry(this.config.maxRetryTimes,
        function(cb) {
            async.reduce(nodeIds, positions, function(memo, nodeId, cb) {
                var node = nodes[nodeId];
                try {
                    positions = node.anchor.positioning(positions, settings);
                    async.setImmediate(function() {
                        cb(null, positions);
                    });
                } catch (err) {
                    async.setImmediate(function() {
                        cb(err);
                    });
                }
            }, function(err, result){
                if(err)  return cb(err);

                if(Object.keys(result).length < nodeIds.length) {
                    console.log(result);
                    err = new Error("Only " + Object.keys(result).length + " anchors positioning complete.");
                    err.code = "ANCHORCLUSTER_POSITION_FAILED";
                    cb(err);
                } else {
                    cb(null, result);
                }

            })
        }, function(err, result) {
            if(err) {
                AnchorCluster.emit('error', err);
                return;
            }

            AnchorCluster.emit('position', result);
        }
    );
};

AnchorCluster.prototype.isPositioned = function isPositioned(rinfo, id) {
    var node = this._nodes[id];
    if(node) {
        node.anchor.config.ip = rinfo.address;
        node.anchor.config.port = rinfo.port;
        return (node.anchor.position.length !== 0);
    }
    return false;
};

AnchorCluster.prototype.getPositions = function getPositions() {
    var nodeIds = Object.keys(this._nodes);
    var positions = Object.create(null);
    for (var i=0; i<nodeIds.length; i++) {
        var nodeId = nodeIds[i];
        var node = this._nodes[nodeId];
        if(node.anchor.position.length !== 0) {
            positions[nodeId] = node.anchor.position;
        }
    }
    return positions;
};

AnchorCluster.prototype._getNode = function _getNode(id) {
    return this._nodes[id] || null;
};

AnchorCluster.prototype._removeNode = function _removeNode(id) {
    delete this._nodes[id];
};