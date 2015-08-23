/**
 * Created by chenqiu on 15/8/7.
 */

var trilateration = require('../mathTools/trilateration.js');
var EventEmitter  = require("events").EventEmitter;
var Util          = require("util");

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

Anchor.prototype.clearPosition = function () {
    this.position = [];
    this._handleClearPosition();
};

Anchor.prototype.setDistances = function (distances) {
    this.distances = distances;
};

Anchor.prototype.positioning = function (positions, settings) {

    if(positions[this.config.id] != undefined)
        return positions;

    if (this.position.length === 0) {
        var positionIds = Object.keys(positions);
        var distanceIds = Object.keys(this.distances);

        var validIds = distanceIds.filter(function(v){ return positionIds.indexOf(v) > -1 });

        switch(positionIds.length) {
            case 0:
                this.position = settings.initPosition;
                break;
            case 1:
                if(validIds.length === 1) {
                    //todo: calc the second position with init angle
                    var p1 = positions[validIds[0]];
                    var d1 = this.distances[validIds[0]];
                    this.position = [p1[0],p1[1] + d1];
                }
                break;
            case 2:
                if(validIds.length === 2) {
                    var p1 = positions[validIds[0]];
                    var p2 = positions[validIds[1]];
                    var d1 = this.distances[validIds[0]];
                    var d2 = this.distances[validIds[1]];
                    if(d1 > 0 && d2 > 0) {
                        this.position = trilateration(p1, p2, d1, d2, 0.05, this._isMirror);
                    }
                }
                break;
            case 3:
                if(validIds.length >= 3) {
                    var p1 = positions[validIds[0]];
                    var p2 = positions[validIds[1]];
                    var p3 = positions[validIds[2]];
                    var d1 = this.distances[validIds[0]];
                    var d2 = this.distances[validIds[1]];
                    var d3 = this.distances[validIds[2]];
                    if(d1 > 0 && d2 > 0) {
                        var p41 = trilateration(p1, p2, d1, d2, 0.05, false);
                        var p42 = trilateration(p1, p2, d1, d2, 0.05, true);

                        if(Math.abs(Math.pow(p41[0] - p3[0], 2) + Math.pow(p41[1] - p3[1], 2) - Math.pow(d3, 2))
                            < Math.abs(Math.pow(p42[0] - p3[0], 2) + Math.pow(p42[1] - p3[1], 2) - Math.pow(d3, 2))) {
                            this.position = p41;
                        } else {
                            this.position = p42;
                        }
                    }
                }
                break;
            default:
                throw new Error("positioning only support 4 anchors.");
        }
    }

    if(this.position.length > 0) {
        positions[this.config.id] = this.position;
        this._handlePositioning();
    }
    return positions;
};

Anchor.prototype._handleClearPosition = function() {
    console.log("Anchor " + this.config.id + " position is cleared");
    this.emit('posClear');
};

Anchor.prototype._handlePositioning = function() {
    console.log("Anchor " + this.config.id + " is positioned at [" + this.position[0] + ',' + this.position[1] + "]");
    this.emit('position');
};

Anchor.prototype._handleProtocolConnect = function() {
    this.state = 'connected';
    this.emit('connect');
};





