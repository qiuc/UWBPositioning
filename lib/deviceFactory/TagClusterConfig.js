/**
 * Created by chenqiu on 15/8/26.
 */
module.exports = TagClusterConfig;

function TagClusterConfig(options) {
    this.maxNodeNumber = options.maxNodeNumber || 10;
    this.clearTimeout = options.clearTimeout || 3000; // ms
    this.removeTimeout = options.removeTimeout || 10000; // ms
}