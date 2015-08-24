/**
 * Created by chenqiu on 15/8/24.
 */
module.exports = TofReportPacket;

function TofReportPacket(options) {
    options = options || {};

    this.command = 0x0100;
}

TofReportPacket.prototype.parse = function(parser) {
    this.command        = 0x0100;
    this.tagAddr        = parser.parseUnsignedNumber(2);
    this.cycCnt         = parser.parseUnsignedNumber(1);
    this.chanPrf        = parser.parseUnsignedNumber(1);
    this.pollTXTime     = parser.parseUnsignedNumber(5);
    this.pollRXTime     = parser.parseUnsignedNumber(5);
    this.rspTXTime      = parser.parseUnsignedNumber(5);
    this.rspRXTime      = parser.parseUnsignedNumber(5);
    this.finalTXTime    = parser.parseUnsignedNumber(5);
    this.finalRXTime    = parser.parseUnsignedNumber(5);
};