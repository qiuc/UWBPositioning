/**
 * Created by chenqiu on 15/8/8.
 */
var deviceFactory = require("../../lib/deviceFactory");

var anchor = deviceFactory.createAnchor({
    ip      : "192.168.1.1",
    port    : 80
});

console.log(anchor);



