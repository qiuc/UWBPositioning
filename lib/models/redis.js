/**
 * Created by chenqiu on 15/11/14.
 */

var redis = require('redis');
var poolModule = require('generic-pool');
module.exports = poolModule.Pool({
    name     : 'redisPool',
    create   : function(callback) {
        var client = redis.createClient();
        callback(null, client);
    },
    destroy  : function(client) {
        client.quit();
    },
    max      : 100,
    min      : 5,
    idleTimeoutMillis : 30000,
    log      : false
});
