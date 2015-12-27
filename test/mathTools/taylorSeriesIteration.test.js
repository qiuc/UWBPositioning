/**
 * Created by chenqiu on 15/8/29.
 */
var taylorSeriesIteration = require('../../lib/mathTools/taylorSeriesIteration');

console.log(taylorSeriesIteration(
    [0, 0, -3],
    [ 0.14540106290377136,
        2.0449955943885265,
        1.425868487830532,
        1.5712695507343035,
        2.1950870141601615
    ],
    [
        [0, 5.17, -0.66],
        [0, 2.709, -0.372],
        [1.2, 0, -0.735],
        [3.652, 2.461, -0.339],
        [3.647, 5.228, -0.318],
        [3.655, 0.779, -0.633]
    ]
));