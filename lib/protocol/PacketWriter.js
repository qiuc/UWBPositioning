/**
 * Created by chenqiu on 15/9/1.
 */

module.exports = PacketWriter;

function PacketWriter() {
    this._buffer = new Buffer(0);
    this._offset = 0;
}

PacketWriter.prototype.toBuffer = function(parser) {
    var buffer = this._buffer;
    this._buffer = new Buffer(this._buffer.length +  4);
    this._offset = 0;
    var packetLength = buffer.length;

    this.writeUnsignedNumber(2, 0x0000);
    this.writeUnsignedNumber(2, packetLength);

    this.writeBuffer(buffer);

    return this._buffer;
};

PacketWriter.prototype.writeUnsignedNumber = function (bytes, value) {
    this._allocate(bytes);

    for(var i = 0; i < bytes; i++) {
        this._buffer[this._offset++] = (value >> (i * 8)) & 0xff;
    }
};

PacketWriter.prototype.writeBuffer = function(value) {
    var bytes = value.length;

    this._allocate(bytes);
    value.copy(this._buffer, this._offset);
    this._offset += bytes;
};

PacketWriter.prototype._allocate = function(bytes) {
    if(!this._buffer) {
        this._buffer = new Buffer(bytes);
        return;
    }

    var bytesRemaining = this._buffer.length - this._offset;
    if(bytesRemaining >= bytes) {
        return;
    }

    var oldBuffer = this._buffer;

    this._buffer = new Buffer(oldBuffer.length + bytes);
    oldBuffer.copy(this._buffer);
};