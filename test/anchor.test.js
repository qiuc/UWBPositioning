/**
 * Created by chenqiu on 15/8/8.
 */
var AnchorConfig = require("../lib/AnchorConfig.js");

var anchorConfig = new AnchorConfig({});

console.log(anchorConfig);

var data = {
    1 : 124,
    11: 246,
    45: 127
};

for(var key in data) {
    if(key === 11) console.log("here");
}
