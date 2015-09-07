/**
 * Created by chenqiu on 15/8/26.
 */
module.exports = TagClusterConfig;

function TagClusterConfig(options) {
    this.maxNodeNumber = options.maxNodeNumber || 10;
    this.processTimeout = options.processTimeout || 50; // ms
    this.removeTimeout = options.removeTimeout || 10000; // ms
}