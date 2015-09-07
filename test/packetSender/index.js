/**
 * Created by chenqiu on 15/8/23.
 */

var dgram   = require('dgram');
var fs      = require('fs');
var through = require("through2");
var split   = require('split');

var readStream = fs.createReadStream(process.argv[2]);
var oldTick = 0;

var socket = dgram.createSocket("udp4");

socket.on("message",function(msg,rinfo) {
    console.log("Server got: "+msg.toString('hex')+" from "+rinfo.address+":"+rinfo.port);
});

socket.on("listening",function() {
    var address = socket.address();
    console.log("server listening "+ address.address+":"+address.port);
});

socket.bind(54321, 'localhost');

readStream.pipe(split())
    .pipe(through(function (line, _, next) {
        readStream.pause();
        var payloads = line.toString().split(',');

        if(!oldTick) {
            oldTick = parseFloat(payloads[0]);
        }
        var timeTick = parseFloat(payloads[0]);

        setTimeout(function() {
            var bytes = payloads.slice(1);
            var buf = new Buffer(bytes);

            socket.send(buf, 0, buf.length,41234, "localhost");
            console.log("send " + timeTick);
            oldTick = timeTick;
            readStream.resume();
            next();
        }, timeTick - oldTick);
    }));