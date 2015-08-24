/**
 * Created by chenqiu on 15/8/23.
 */
var Parser      = require('./Parser');
var Packets     = require('./packets');
var Stream      = require('stream').Stream;
var Util        = require('util');

module.exports = Protocol;
Util.inherits(Protocol, Stream);

function Protocol(options) {
    Stream.call(this);

    options = options || {};

    this.readable = true;
    this.writable = true;

    this._config    = options.config || {};
    this._task      = options.task;
    this._ended     = false;
    this._destroyed = false;

    this._parser = new Parser({
        onError  : this.handleParserError.bind(this),
        onPacket : this._parsePacket.bind(this),
        config   : this._config
    });
}

Protocol.prototype.write = function(buffer, rinfo) {
    this._parser.write(buffer, rinfo);
    return true;
};

Protocol.prototype.pause = function() {
    this._parser.pause();
};

Protocol.prototype.resume = function() {
    this._parser.resume();
};

Protocol.prototype.destroy = function() {
    this._destroyed = true;
    this._parser.pause();
};

Protocol.prototype._parsePacket = function(packetHeader) {
    console.log(packetHeader);

    var Packet = this._determinePacket();
    var packet = new Packet();

    packet.parse(this._parser);

    console.log(packet);
};

Protocol.prototype._determinePacket = function() {
    var command = this._parser.parseUnsignedNumber(2);

    switch (command) {
        case 0x0100: return Packets.TofReportPacket;
    }
};

Protocol.prototype.handleNetworkError = function(err) {
    throw err;
};

Protocol.prototype.handleParserError = function(err) {
    throw err;
};