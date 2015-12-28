/**
 * Created by chenqiu on 15/8/28.
 */

var mathTools       = require("../../../mathTools");
var async           = require("async");

module.exports = function (r, p, cb) {

    var pCur = [0, 0, -3];
    var count = 0;
    var step =1;

    async.whilst(
        function() {
            return (count < 50) && (step > 0.002);
        },
        function(callback) {
            var result = mathTools.taylorSeriesIteration(pCur, r, p);
            pCur = result.pCur;
            step = result.step;
            count++;
            process.nextTick(function() {
                callback(null);
            });
        },
        function(err) {
            // calculate GDOP, no process later
            var result = mathTools.errorGDOP(pCur, r, p);
            cb(err, pCur);
        }
    );
};