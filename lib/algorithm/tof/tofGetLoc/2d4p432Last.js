/**
 * Created by chenqiu on 15/8/28.
 */

var mathTools       = require("../../../mathTools");

var w432LastPoint = 0.3;
var w432ErrLast   = 5;
var w4324thCircle = 0.2;

module.exports = function (d, p) {
    //var w1 = w4324thCircle;
    //var w2 = w432LastPoint;
    var orders = [
        [0,1,2,3], [0,1,3,2], [0,2,1,3], [0,2,3,1],
        [0,3,1,2], [0,3,2,1], [1,2,3,0], [1,2,0,3],
        [1,3,0,2], [1,3,2,0], [2,3,0,1], [2,3,1,0]
    ];

    var result = orders.reduce(function(result, order) {

        d = [d[order[0]], d[order[1]], d[order[2]], d[order[3]]];
        p = [p[order[0]], p[order[1]], p[order[2]], p[order[3]]];

        var points = mathTools.circleCross(p[0], d[0], p[1], d[1]);

        points.forEach(function(point) {

            var error = mathTools.error2D(point, [d[0], d[1], d[2]], [p[0], p[1], p[2]]) +
                w432LastPoint * mathTools.error2D(point,[d[3]], [p[3]]);

            if(result.error > error) {
                result.error = error;
                result.point = point;
            }

        });

        return result;

    }, {point:[], error: Infinity});

    return result.point;
};