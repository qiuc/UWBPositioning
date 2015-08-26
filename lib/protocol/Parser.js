/**
 * Created by chenqiu on 15/8/24.
 */

var bignum              = require('bignum');
var PacketHeader        = require('./PacketHeader');

module.exports = Parser;

function Parser(options) {
    options = options || {};

    this._buffer            = new Buffer(0);
    this._offset            = 0;
    this._packetHeader      = null;
    this._packetEnd         = null;
    this._packetOffset      = null;
    this._onError           = options.onError || function(err) { throw err; };
    this._onPacket          = options.onPacket || function() {};
    this._paused            = false;
}

Parser.prototype.write = function(buffer) {
    if(this._paused) {
        return;
    }

    var err;

    this.append(buffer);

    while (true) {
        if(!this._packetHeader) {
            if(this._bytesRemaining() < 4) {
                //Something maybe wrong about packet, reset the buffer
                if(this._bytesRemaining() !== 0) {
                    this.resetBuffer();
                    err = new Error('Packet length error: '+this._buffer.toString('hex'));
                    err.code = "PARSER_PACKET_LENGTH_ERROR";
                    this._onError(err);
                }
                break;
            }

            this._packetHeader = new PacketHeader(
                this.parseUnsignedNumber(2),
                this.parseUnsignedNumber(2)
            );
        }

        if(this._bytesRemaining() < this._packetHeader.length) {
            //Something maybe wrong about packet, reset the buffer
            if(this._bytesRemaining() !== 0) {
                this.resetBuffer();
                err = new Error('Packet length error: '+this._buffer.toString('hex'));
                err.code = "PARSER_PACKET_LENGTH_ERROR";
                this._onError(err);
            }
            break;
        }

        this._packetEnd     = this._offset + this._packetHeader.length;
        this._packetOffset  = this._offset;

        var hadException = true;
        try {
            this._onPacket(this._packetHeader);
            hadException = false;
        } catch (err) {
            if(!err || typeof err.code !== 'string' || err.code.substr(0,7) !== 'PARSER_') {
                throw err;
            }

            this._onError(err);
            hadException = false;
        } finally {
            this._advanceToNextPacket();

            if(hadException) {
                process.nextTick(this.write.bind(this));
            }
        }
    }
};

Parser.prototype.append = function (chunk) {
    if(!chunk || chunk.length === 0) {
        return;
    }

    var buffer      = chunk;
    var sliceEnd    = this._buffer.length;
    var sliceStart  = this._packetOffset === null
        ? this._offset
        : this._packetOffset;
    var sliceLength = sliceEnd - sliceStart;

    if (sliceLength !== 0) {
        // Create a new Buffer
        buffer = new Buffer(sliceLength + chunk.length);

        // Copy data
        this._buffer.copy(buffer, 0, sliceStart, sliceEnd);
        chunk.copy(buffer, sliceLength);
    }

    // Adjust data-tracking pointers
    this._buffer        = buffer;
    this._offset        = this._offset - sliceStart;
    this._packetEnd     = this._packetEnd !== null
        ? this._packetEnd - sliceStart
        : null;
    this._packetOffset  = this._packetOffset !== null
        ? this._packetOffset - sliceStart
        : null;
};

Parser.prototype.pause = function() {
    this._paused = true;
};

Parser.prototype.resume = function() {
    this._paused = false;

    process.nextTick(this.write.bind(this));
};

Parser.prototype.peak = function() {
    return this._buffer[this.offset];
};

Parser.prototype.parseUnsignedNumber = function(bytes) {
    if(bytes === 1) {
        return this._buffer[this._offset++];
    }

    var buffer = this._buffer;
    var offset = this._offset + bytes -1;
    var value  = 0;

    if(bytes > 8) {
        var err     = new Error('parseUnsignedNumber: Supports only up to 8 bytes');
        err.offset  = (this.offset - this._packetOffset -1);
        err.code    = 'PARSER_UNSIGNED_TOO_LONG';
        throw err;
    }

    if(bytes <= 4) {
        while (offset >= this._offset) {
            value = ((value << 8) | buffer[offset]) >>> 0;
            offset--;
        }
        this._offset += bytes;
    } else {
        var numBuf = this.parseBuffer(bytes);
        value = bignum.fromBuffer(numBuf, { endian : 'little', size : 'auto' });
    }

    return value;
};

Parser.prototype.parseBuffer = function(length) {
    var response = new Buffer(length);
    this._buffer.copy(response, 0, this._offset, this._offset + length);

    this._offset += length;
    return response;
};

Parser.prototype.reachedPacketEnd = function() {
    return this._offset === this._packetEnd;
};

Parser.prototype._bytesRemaining = function() {
    return this._buffer.length - this._offset;
};

Parser.prototype._advanceToNextPacket = function() {
    this._offset        = this._packetEnd;
    this._packetHeader  = null;
    this._packetEnd     = null;
    this._packetOffset  = null;
};

Parser.prototype.resetBuffer = function() {
    this._buffer            = new Buffer(0);
    this._offset            = 0;
    this._packetHeader      = null;
    this._packetEnd         = null;
    this._packetOffset      = null;
};