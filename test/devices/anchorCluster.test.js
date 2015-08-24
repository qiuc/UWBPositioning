/**
 * Created by chenqiu on 15/8/8.
 */
var AnchorCluster = require("../../lib/deviceFactory/AnchorCluster.js");

var anchorCluster = new AnchorCluster;

anchorCluster.add({id: 1});
anchorCluster.add({id: 2});
anchorCluster.add({id: 3});
anchorCluster.add({id: 4});

// set anchor distance
anchorCluster._nodes['1'].anchor.distances = {
    "2" : 7.162085,
    "3" : 10.487267,
    "4" : 6.794281
};

anchorCluster._nodes['2'].anchor.distances = {
    "1" : 7.162085,
    "3" : 6.741098,
    "4" : 10.042475
};

anchorCluster._nodes['3'].anchor.distances = {
    "1" : 10.487267,
    "2" : 6.741098,
    "4" : 8.324416
};

anchorCluster._nodes['4'].anchor.distances = {
    "1" : 6.794281,
    "2" : 10.042475,
    "3" : 8.324416
};

anchorCluster.positioning([0,0], false);




