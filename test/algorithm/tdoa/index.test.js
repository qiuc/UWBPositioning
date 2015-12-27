/**
 * Created by chenqiu on 15/8/27.
 */
var tdoa = require('../../../lib/algorithm/tdoa');

var anchorPositions = [
    [0, 5.17, -0.66],
    [0, 2.709, -0.372],
    [1.2, 0, -0.735],
    [3.652, 2.461, -0.339],
    [3.647, 5.228, -0.318],
    [3.655, 0.779, -0.633]
];

var tdoaData = [
    { pollRXTime : '915418234839', timeDelta  : 0 },
    { pollRXTime : '915418234870', timeDelta  : 0 },
    { pollRXTime : '915418235275', timeDelta  : 0 },
    { pollRXTime : '915418235143', timeDelta  : 0 },
    { pollRXTime : '915418235174', timeDelta  : 0 },
    { pollRXTime : '915418235307', timeDelta  : 0 }
];

tdoa(anchorPositions, tdoaData, 0, function(err, result) {
    if(err) return console.error(err);
    console.log(result);
});



