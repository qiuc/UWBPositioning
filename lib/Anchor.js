/**
 * Created by chenqiu on 15/8/7.
 */

var EventEmitter = require("events").EventEmitter;
var Util         = require("util");

module.exports = Anchor;
Util.inherits(Anchor, EventEmitter);
var Anchor = function (options) {
    EventEmitter.call(this);

    this.config = options.config;
    this.state = "disconnected";
    this.position = [];
    this.distances = {};
};

Anchor.calcLocations = function (anchors, mirror) {
    anchors[0].position = [0, 0];
};

Anchor.prototype._handleProtocalPositioning = function() {
    this.state = 'positioned';
    this.emit('position');
};

Anchor.prototype._handleProtocalConnect = function() {
    this.state = 'connected';
    this.emit('connect');
};





