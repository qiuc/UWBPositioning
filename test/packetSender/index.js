/**
 * Created by chenqiu on 15/8/23.
 */

var dgram   = require('dgram');
var fs      = require('fs');
var through = require("through2");
var split   = require('split');

var readStream = fs.createReadStream(process.argv[2]);
var oldTick = 0;

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

            var client = dgram.createSocket("udp4");
            client.send(buf, 0, buf.length,41234, "localhost", function() {
                client.close();
            });
            console.log("send " + timeTick);
            oldTick = timeTick;
            readStream.resume();
            next();
        }, timeTick - oldTick);
    }));