/**
 * Created by chenqiu on 15/8/7.
 */
var trilateration = require('../../lib/mathTools/trilateration.js');

console.log(trilateration(
    [0, 0],         //p1
    [7.162085, 0],  //p2
    10.487267,
    6.741098,
    0.05, true
));

console.log(trilateration(
    [0, 0],         //p1
    [7.162085, 0],  //p2
    10.487267,
    6.741098,
    0.05, false
));