/**
 * Created by chenqiu on 15/8/8.
 */
var AnchorCluster = require("../../lib/objects/AnchorCluster.js");

var anchorCluster = new AnchorCluster;

anchorCluster.add({id: 1});
anchorCluster.add({id: 2});
anchorCluster.add({id: 3});
anchorCluster.add({id: 4});

anchorCluster.positioning();

console.log(anchorCluster._nodes['1']);



