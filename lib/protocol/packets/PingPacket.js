/**
 * Created by chenqiu on 15/9/1.
 */
module.exports = PingPacket;

function PingPacket(options) {
    options = options || {};

    this.name    = "Ping";
    this.command = 0x0200;
}

PingPacket.prototype.write = function(writer) {
    writer.writeUnsignedNumber(2, this.command);
};

PingPacket.prototype.parse = function(parser) {
    this.command        = parser.parseUnsignedNumber(2);
};