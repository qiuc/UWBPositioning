/**
 * Created by chenqiu on 15/8/29.
 */
var tofGetLoc = require('../../../lib/algorithm/tof/tofGetLoc');

var d = [2.05614274714543, 4.40464099879338, 9.78773416063749, 12.2136892839168];

var p = [[0,0], [6.355576,0], [6.20260760804457,-9.01643149968454], [0.157279820546241,-11.6023170144044]];

console.log(tofGetLoc.mode2d4p432Last(d, p));