/**
 * Created by chenqiu on 15/8/7.
 */

var mathTools   = require('../mathTools');

module.exports = Anchor;

function Anchor(options) {

    this.config = options.config;

    this.state          = "disconnected";
    this.position       = [];
    this.distances      = Object.create(null);
}

Anchor.prototype.clearPosition = function () {
    this.position = [];
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

        switch(validIds.length) {
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
                        this.position = mathTools.trilateration(p1, p2, d1, d2, 0.05, settings.isMirror);
                    }
                }
                break;

            default:
                if(validIds.length >= 3) {
                    var p1 = positions[validIds[0]];
                    var p2 = positions[validIds[1]];
                    var p3 = positions[validIds[2]];
                    var d1 = this.distances[validIds[0]];
                    var d2 = this.distances[validIds[1]];
                    var d3 = this.distances[validIds[2]];
                    if(d1 > 0 && d2 > 0) {
                        var p41 = mathTools.trilateration(p1, p2, d1, d2, 0.05, false);
                        var p42 = mathTools.trilateration(p1, p2, d1, d2, 0.05, true);

                        if(Math.abs(Math.pow(p41[0] - p3[0], 2) + Math.pow(p41[1] - p3[1], 2) - Math.pow(d3, 2))
                            < Math.abs(Math.pow(p42[0] - p3[0], 2) + Math.pow(p42[1] - p3[1], 2) - Math.pow(d3, 2))) {
                            this.position = p41;
                        } else {
                            this.position = p42;
                        }
                    }
                }
                break;
        }
    }

    if(this.position.length > 0) {
        positions[this.config.id] = this.position;
    }
    return positions;
};





