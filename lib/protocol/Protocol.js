/**
 * Created by chenqiu on 15/8/23.
 */
var Parser          = require('./Parser');
var PacketWriter    = require('./PacketWriter');
var Packets         = require('./packets');
var EventEmitter    = require("events").EventEmitter;
var Util            = require('util');

module.exports = Protocol;
Util.inherits(Protocol, EventEmitter);

function Protocol(options) {
    EventEmitter.call(this);

    options = options || {};

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

Protocol.prototype._parsePacket = function(packetHeader, rinfo) {
    var Packet = this._determinePacket();
    var packet = new Packet();

    packet.parse(this._parser);

    if(this._parser.reachedPacketEnd()) {
        this.emit('packet', { rinfo: rinfo, header: packetHeader, payload: packet });
    }
};

Protocol.prototype._determinePacket = function() {
    var command = this._parser.command();

    switch (command) {
        case 0x0100: return Packets.TofReportPacket;
        case 0x0202: return Packets.TdoaReportPacket;
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

Protocol.prototype._emitPacket = function(packet, rinfo) {
    var packetWriter = new PacketWriter();
    packet.write(packetWriter);
    this.emit('data', packetWriter.toBuffer(this._parser), rinfo);
};

Protocol.prototype.ping = function (options) {
    var packet = new Packets.PingPacket;
    var rinfo = options.rinfo;
    this._emitPacket(packet, rinfo);
};