/**
 * Created by chenqiu on 15/8/8.
 */
var deviceFactory = require("../../lib/objects/deviceFactory.js");

var anchor = deviceFactory.createAnchor({
    id      : 1,
    ip      : "192.168.1.1",
    port    : 80
});

console.log(anchor);



