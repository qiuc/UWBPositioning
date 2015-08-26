/**
 * Created by chenqiu on 15/8/26.
 */
module.exports = AnchorClusterConfig;

function AnchorClusterConfig(options) {
    this.maxNodeNumber = options.maxNodeNumber || 4;
    this.maxRetryTimes = options.maxRetryTimes || 10;
}