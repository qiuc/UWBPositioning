/**
 * Created by chenqiu on 15/8/27.
 */
var calcTofDistance = require('../../../lib/algorithm/tof/calcTofDistance');
var math            = require('mathjs');

var chanPrf = 33;
var pollTXTime = math.bignumber('308049538');
var pollRXTime = math.bignumber('1064863147617');
var rspTXTime  = math.bignumber('1065118754434');
var rspRXTime  = math.bignumber('563661116');
var finalTXTime= math.bignumber('883165314');
var finalRXTime= math.bignumber('1065438260866');

var result = calcTofDistance(chanPrf, pollTXTime, pollRXTime, rspTXTime, rspRXTime, finalTXTime, finalRXTime, 0, 0);

// 8.26226157267644
console.log(result);

chanPrf = 33;
pollTXTime = math.bignumber('2868018818');
pollRXTime = math.bignumber('673089648806');
rspTXTime  = math.bignumber('673345255538');
rspRXTime  = math.bignumber('3123627474');
finalTXTime= math.bignumber('3443131522');
finalRXTime= math.bignumber('673664761344');

result = calcTofDistance(chanPrf, pollTXTime, pollRXTime, rspTXTime, rspRXTime, finalTXTime, finalRXTime, 0, 0);

// 4.43747349686843
console.log(result);