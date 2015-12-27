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
            //console.log(count);
            //console.log(pCur);
            //console.log(step);
            process.nextTick(function() {
                callback(null);
            });
        },
        function(err) {
            var result = mathTools.errorGDOP(pCur, r, p);
            //console.log(result);
            cb(err, pCur);
        }
    );
};