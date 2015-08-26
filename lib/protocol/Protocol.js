/**
 * Created by chenqiu on 15/8/23.
 */
var Parser          = require('./Parser');
var Packets         = require('./packets');
var EventEmitter    = require("events").EventEmitter;
var Util            = require('util');

module.exports = Protocol;
Util.inherits(Protocol, EventEmitter);

function Protocol(options) {
    EventEmitter.call(this);

    options = options || {};

    this.readable = true;
    this.writable = true;

    this._config    = options.config || {};
    this._stopped    = false;

    this._parser = new Parser({
        onError  : this.handleParserError.bind(this),
        onPacket : this._parsePacket.bind(this),
        config   : this._config
    });
}

Protocol.prototype.write = function(buffer, rinfo) {
    if(!this._stopped) {
        this._parser.write(buffer, rinfo);
    }

    return true;
};

Protocol.prototype.pause = function() {
    this._parser.pause();
};

Protocol.prototype.resume = function() {
    this._parser.resume();
};

Protocol.prototype.run = function() {
    this._stopped = false;
    this._parser.resume();
};

Protocol.prototype.stop = function() {
    this._stopped = true;
    this._parser.resetBuffer();
    this._parser.pause();
};

Protocol.prototype._parsePacket = function(packetHeader) {
    var Packet = this._determinePacket();
    var packet = new Packet();

    packet.parse(this._parser);

    if(this._parser.reachedPacketEnd()) {
        this.emit('packet', { header: packetHeader, payload: packet });
    }
};

Protocol.prototype._determinePacket = function() {
    var command = this._parser.parseUnsignedNumber(2);

    switch (command) {
        case 0x0100: return Packets.TofReportPacket;
    }
};

Protocol.prototype.handleNetworkError = function(err) {
    this._stopped = true;
    this._parser.resetBuffer();
    this._parser.pause();
};

Protocol.prototype.handleParserError = function(err) {
    this.emit("error", err);
};