/**
 * Created by chenqiu on 15/8/8.
 */

module.exports = AnchorConfig;

function AnchorConfig(options) {
    this.id     = options.id;
    this.ip     = options.ip;
    this.port   = options.port || 80;
}

