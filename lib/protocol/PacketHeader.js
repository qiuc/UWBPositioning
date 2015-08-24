/**
 * Created by chenqiu on 15/8/24.
 */
module.exports = PacketHeader;

function PacketHeader(anchorId, length) {
    this.anchorId   = anchorId;
    this.length     = length;
}