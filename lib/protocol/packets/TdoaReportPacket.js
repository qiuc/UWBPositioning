/**
 * Created by chenqiu on 15/8/24.
 */
module.exports = TofReportPacket;

function TofReportPacket(options) {
    options = options || {};

    this.name    = "TdoaReport";
    this.command = 0x0202;
}

TofReportPacket.prototype.parse = function(parser) {
    this.command        = parser.parseUnsignedNumber(2);
    this.tagId          = parser.parseUnsignedNumber(2);
    this.cycCnt         = parser.parseUnsignedNumber(1);
    this.pollRXTime     = parser.parseUnsignedNumber(5);
};