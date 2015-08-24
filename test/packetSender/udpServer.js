/**
 * Created by chenqiu on 15/8/23.
 */

var dgram = require('dgram');
var server = dgram.createSocket("udp4");

server.on("message",function(msg,rinfo) {
    console.log("Server got: "+msg.toString('hex')+" from "+rinfo.address+":"+rinfo.port);
});

server.on("listening",function() {
    var address = server.address();
    console.log("server listening "+ address.address+":"+address.port);
});

server.bind(41234, 'localhost');