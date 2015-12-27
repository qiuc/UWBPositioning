/**
 * Created by chenqiu on 15/11/15.
 */

var redisPool = require('./redis.js');
var uuid      = require('node-uuid');

var MAX_GROUP_NUM = 16;

var index = function(cb) {
    redisPool.acquire(function(err, client) {
        if (err) return cb(err);
        client.SMEMBERS("group:", function(err,ids) {
            if(err) return cb(err);
            var groups = [];
            var count = ids.length;
            ids.forEach(function(id) {
                client.HGETALL("group:"+id, function(err, result) {
                    if (err) return cb(err);

                    groups.push(result);
                    count --;
                    if(count === 0) {
                        redisPool.release(client);
                        return cb(null, groups);
                    }
                });
            });
            if(ids.length === 0) {
                redisPool.release(client);
                cb(null, []);
            }
        });
    });
};

var create = function(group, cb) {
    redisPool.acquire(function(err, client) {
        if(err) return cb(err);
        client.SMEMBERS("group:", function(err, ids) {
            if(err) return cb(err);
            if(ids.length > MAX_GROUP_NUM) {
                redisPool.release(client);
                var error = new Error("group num is reach the max size.");
                error.code = "GROUP_MAX_NUM_REACH";
                return cb(error);
            }
            var groupId = uuid.v4();
            var groupData = {
                id              : groupId,
                maxAnchorNum    : group.maxNodeNumber   || 4,
                positioningType : group.positioningType || "TOF"
            };
            client.HMSET("group:" + groupId, groupData, function(err) {
                if(err) return cb(err);

                client.SADD("group:", groupId, function(err) {
                    redisPool.release(client);
                    return cb(err, groupId);
                });
            });
        });
    });
};

var createDefault = function(group, cb) {
    redisPool.acquire(function(err, client) {
        if(err) return cb(err);
        client.SISMEMBER("group:", "default", function(err, result) {
            if(err) return cb(err);
            if(result) {
                return cb(null);
            }
            client.SADD("group:", "default", function(err) {
                if(err) return cb(err);
                var groupData = {
                    id              : "default",
                    maxAnchorNum    : group.maxNodeNumber || 4,
                    positioningType : group.positioningType || "TOF"
                };
                client.HMSET("group:default", groupData, function(err) {
                    redisPool.release(client);
                    return cb(err);
                });
            });
        });
    });
};

var show = function(id, cb) {
    redisPool.acquire(function(err, client) {
        if(err) return cb(err);
        client.SISMEMBER("group:", id, function(err, result) {
            if (err) return cb(err);
            if (!result) {
                redisPool.release(client);
                var error = new Error("group not found.");
                error.code = "GROUP_NOT_FOUND";
                return cb(error);
            }
            client.HGETALL("group:"+id, function(err, result) {
                if (err) return cb(err);
                redisPool.release(client);
                return cb(null, result);
            });
        });
    });
};

var destroy = function(id, cb) {
    if(id === "default") {
        var error = new Error("Group default can not be deleted.");
        error.code = "GROUP_DEFAULT_CANNOT_DELETE";
        return cb(error);
    }
    redisPool.acquire(function(err, client) {
        if(err) return cb(err);
        client.SISMEMBER("group:", id, function(err, result) {
            if (err) return cb(err);
            if (!result) {
                redisPool.release(client);
                var error = new Error("Group not found.");
                error.code = "GROUP_NOT_FOUND";
                return cb(error);
            }
            client.SMEMBERS("group:"+id+":anchors", function(err, anchorIds) {
                if (err) return cb(err);
                if (anchorIds.length > 0) {
                    redisPool.release(client);
                    var error = new Error("Group has anchors.");
                    error.code = "GROUP_HAS_ANCHORS";
                    return cb(error);
                }
                client.SREM("group:", id, function(err) {
                    if (err) return cb(err);
                    client.DEL("group:"+id, function(err) {
                        if(err) return cb(err);
                        client.DEL("group:"+id+":anchors", function(err) {
                            redisPool.release(client);
                            return cb(err);
                        });
                    });
                });
            });
        });
    });
};

module.exports = {
    index           : index,
    create          : create,
    createDefault   : createDefault,
    show            : show,
    destroy         : destroy
};