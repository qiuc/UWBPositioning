/**
 * Created by chenqiu on 15/8/7.
 */

var EventEmitter = require("events").EventEmitter;
var Util         = require("util");

module.exports = Anchor;
Util.inherits(Anchor, EventEmitter);
function Anchor(options) {
    EventEmitter.call(this);

    this.config = options.config;

    this.state = "disconnected";
    this.position = [];
    this.distances = {};
}

Anchor.prototype.end = function (cb) {
    // Process when connection closed
    this.state = "disconnected";

    return cb(null);
};

Anchor.prototype._handleProtocalPositioning = function() {
    this.state = 'positioned';
    this.emit('position');
};

Anchor.prototype._handleProtocalConnect = function() {
    this.state = 'connected';
    this.emit('connect');
};





