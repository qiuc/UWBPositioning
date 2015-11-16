/**
 * Created by chenqiu on 15/11/14.
 */

var redisPool = require('./redis.js');
var async     = require('async');
var tof       = require("../algorithm/tof");

var TAG_DISTANCE_PEXPIRE  = 1000; //ms
var TAG_PROCESS_INTERVAL  = 50; //ms
var TAG_POSITION_EXPIRE   = 10; //s
var MAX_CYCLE_COUNT       = 255;

var index = function(cb) {
    redisPool.acquire(function(err, client) {
        if (err) return cb(err);
        client.SMEMBERS("tag:", function(err,ids) {
            if(err) return cb(err);
            var tags = [];
            var count = ids.length;
            ids.forEach(function(id) {
                client.HGETALL("tag:"+id, function(err, result) {
                    if (err) return cb(err);
                    var tagData = result;
                    client.HGETALL("tag:"+id+":alarm", function(err, result) {
                        if (err) return cb(err);
                        tagData["alarm"] = result;

                        tags.push(tagData);
                        count --;
                        if(count === 0) {
                            redisPool.release(client);
                            return cb(null, tags);
                        }
                    })
                });
            });
            if(ids.length === 0) {
                redisPool.release(client);
                cb(null, []);
            }
        });
    });
};

var create = function(tag, cb) {
    redisPool.acquire(function(err, client) {
        if(err) return cb(err);
        client.SISMEMBER("tag:", tag.id, function(err, result) {
            if(err) return cb(err);
            if(result) {
                redisPool.release(client);
                var error = new Error("Tag id is exists");
                error.code = "Tag_ID_EXISTS";
                return cb(error);
            }
            var tagData = {
                id      : tag.id,
                status  : "offline"
            };
            client.SADD("tag:", tag.id, function(err) {
                if(err) return cb(err);
                client.HMSET("tag:" + tag.id, tagData, function(err) {
                    redisPool.release(client);
                    return cb(err, tag.id);
                });
            });
        });
    });
};

var show = function(id, cb) {
    redisPool.acquire(function(err, client) {
        if(err) return cb(err);
        client.SISMEMBER("tag:", id, function(err, result) {
            if (err) return cb(err);
            if (!result) {
                redisPool.release(client);
                var error = new Error("Tag not found.");
                error.code = "TAG_NOT_FOUND";
                return cb(error);
            }
            client.HGETALL("tag:"+id, function(err, result) {
                if (err) return cb(err);
                var tagData = result;
                client.HGETALL("tag:"+id+":alarm", function(err, result) {
                    if (err) return cb(err);
                    redisPool.release(client);
                    tagData["alarm"] = result;
                    return cb(null, tagData);
                });
            });
        });
    });
};

var destroy = function(id, cb) {
    redisPool.acquire(function(err, client) {
        if(err) return cb(err);
        client.SISMEMBER("tag:", id, function(err, result) {
            if (err) return cb(err);
            if (!result) {
                redisPool.release(client);
                var error = new Error("Tag not found.");
                error.code = "TAG_NOT_FOUND";
                return cb(error);
            }
            client.SREM("tag:", id, function(err) {
                if (err) return cb(err);
                client.DEL("tag:"+id, function(err) {
                    if(err) return cb(err);
                    client.DEL("tag:"+id+":alarm", function(err) {
                        if(err) return cb(err);
                        client.DEL("tag:"+id+":position", function(err) {
                            redisPool.release(client);
                            return cb(err);
                        });
                    });
                });
            });
        });
    });
};

var setPosition = function(id,position, cb) {
    redisPool.acquire(function(err, client) {
        if(err) return cb(err);
        client.SISMEMBER("tag:", id, function(err, result) {
            if (err) return cb(err);
            if (!result) {
                redisPool.release(client);
                var error = new Error("Tag not found.");
                error.code = "TAG_NOT_FOUND";
                return cb(error);
            }
            client.SET("tag:" + id + ":position", JSON.stringify(position), function(err) {
                if (err) return cb(err);
                client.EXPIRE("tag:" + id + ":position", TAG_POSITION_EXPIRE, function(err) {
                    if (err) return cb(err);
                    client.HSET("tag:" + id, "status", "online", function(err){
                        redisPool.release(client);
                        return cb(err);
                    });
                });
            });
        });
    });
};

var checkOffline = function(client, id, cb) {
    client.HGET("tag:"+id, "status", function(err, status) {
        if (err) return cb(err);
        if (status === 'offline') {
            return cb(err, false);
        }
        client.EXISTS("tag:" + id + ":position", function(err, result) {
            if (err) return cb(err);
            if(result){
                return cb(err, false);
            }
            client.HSET("tag:"+id, "status", "offline", function(err) {
                return cb(err, true);
            });
        });
    });
};

var setTofData = function(anchorId, packet, cb) {

    if(packet.cycCnt > MAX_CYCLE_COUNT) {
        var error = new Error("cycCnt is greater than 255");
        error.code = "TOF_CYCCNT_GREATER_THAN_255";
        return cb(error);
    }
    redisPool.acquire(function(err, client) {
        if(err) cb(err);
        async.waterfall([
            function(callback) {
                client.SISMEMBER("anchor:", anchorId, function (err, result) {
                    if (err) return callback(err);
                    if (!result) {
                        var error = new Error("Anchor not found.");
                        error.code = "ANCHOR_NOT_FOUND";
                        return callback(error);
                    }
                    callback(null);
                });
            },
            function(callback) {
                client.SISMEMBER("tag:", packet.tagId, function (err, result) {
                    if (err) return callback(err);
                    if (!result) {
                        var error = new Error("Tag not found.");
                        error.code = "TAG_NOT_FOUND";
                        return callback(error);
                    }
                    callback(null);
                });
            },
            function(callback) {
                client.EXISTS("tag:"+packet.tagId+":cycle:"+packet.cycCnt+":anchors", function(err, result) {
                    if (err) return callback(err);
                    callback(null, result);
                });
            },
            function(cycleExists, callback) {
                client.SADD("tag:"+packet.tagId+":cycle:"+packet.cycCnt+":anchors", anchorId, function(err) {
                    if (err) return callback(err);
                    callback(null, cycleExists);
                });
            },
            function(cycleExists, callback) {
                if(cycleExists) return callback(null);

                client.PEXPIRE("tag:" + packet.tagId + ":cycle:" + packet.cycCnt + ":anchors", TAG_DISTANCE_PEXPIRE, function (err) {
                    if (err) return callback(err);
                    callback(null);
                });
            },
            function(callback) {
                var data = {
                    chanPrf     : packet.chanPrf,
                    pollTXTime  : packet.pollTXTime,
                    pollRXTime  : packet.pollRXTime,
                    rspTXTime   : packet.rspTXTime,
                    rspRXTime   : packet.rspRXTime,
                    finalTXTime : packet.finalTXTime,
                    finalRXTime : packet.finalRXTime
                };
                client.HMSET("tag:"+packet.tagId+":cycle:"+packet.cycCnt+":anchors:"+anchorId, data, function(err) {
                    if (err) return callback(err);
                    callback(null);
                });
            },
            function(callback) {
                client.PEXPIRE("tag:"+packet.tagId+":cycle:"+packet.cycCnt+":anchors:"+anchorId, TAG_DISTANCE_PEXPIRE, function(err) {
                    if (err) return callback(err);
                    callback(null);
                });
            }
        ], function(err) {
            redisPool.release(client);
            cb(err);
        });
    });
};

var positioningLoop = function (cb) {
    redisPool.acquire(function(err, client) {
        if (err) cb(err);
        async.waterfall([
            function(callback) {
                client.SMEMBERS("tag:", function(err,ids) {
                    callback(err, ids);
                });
            },
            function(ids, callback) {
                async.map(ids,
                    function(id, mapCallback) {
                        checkOffline(client, id, function(err, result) {
                            if(err) return mapCallback(err);
                            if (result) return mapCallback(null, "TAG_OFFLINE");
                            positioning(client, id, mapCallback);
                        });
                    },
                    function(err, results) {
                        if(err) return callback(err);
                        var positions = Object.create(null);
                        for(var i=0; i< results.length; i++) {
                            if(results[i] === 'TAG_OFFLINE') {
                                positions[ids[i]] = "TAG_OFFLINE";
                            } else if (typeof results[i] !== 'string'){
                                positions[ids[i]] = results[i];
                            }
                        }
                        callback(null, positions);
                    }
                );
            }
        ], function(err, positions) {
            redisPool.release(client);
            if(err) return cb(err);
            if(Object.keys(positions).length) {
                cb(null, positions);
            }
        });
    });
};

var positioning = function (client, id, cb) {
    client.KEYS("tag:"+id+":cycle:*:anchors", function(err, keys) {
        if (err) return cb(err);
        if(keys.length === 0) return cb(null, "TAG_NO_DATA");

        // Get the last key as the latest data
        var key = keys[keys.length - 1];

        client.PTTL(key, function (err, pttl) {
            if (err) return cb(err);
            if (TAG_DISTANCE_PEXPIRE - TAG_PROCESS_INTERVAL < pttl) {
                return cb(null, "TAG_CYCLE_NO_PROCESS");
            }
            client.SMEMBERS("group:", function (err, groupIds) {
                if (err) return cb(err);
                var count = groupIds.length;
                var validIds = [];
                groupIds.forEach(function (groupId) {
                    client.SINTER("group:" + groupId + ":anchors", key, function (err, anchorIds) {
                        if (err) return cb(err);
                        if (anchorIds.length >= 4) validIds = anchorIds;
                        count--;
                        if (count === 0) {
                            if (validIds.length === 0) {
                                return cb(null, "TAG_CYCLE_DATA_NOT_ENOUGH");
                            }
                            var anchorCnt = validIds.length;
                            var anchorPositions = [];
                            var tofData = [];
                            validIds.forEach(function (anchorId) {
                                client.GET("anchor:" + anchorId + ":position", function (err, result) {
                                    if (err) return cb(err);
                                    anchorPositions.push(JSON.parse(result));
                                    client.HGETALL(key + ":" + anchorId, function (err, result) {
                                        if (err) return callback(err);
                                        result['modified'] = 0;
                                        tofData.push(result);
                                        anchorCnt--;
                                        if (anchorCnt === 0) {
                                            var position = tof(anchorPositions, tofData, 0);
                                            client.DEL(key, function (err) {
                                                if (err) return cb(err);
                                                setPosition(id, position, function (err) {
                                                    cb(err, position);
                                                });
                                            });
                                        }
                                    });
                                });
                            });
                        }
                    });
                });
                if (groupIds.length === 0) {
                    return cb(null, "TAG_CYCLE_NO_GROUP");
                }
            });
        });
    });
};

module.exports = {
    index               : index,
    create              : create,
    show                : show,
    destroy             : destroy,
    setPosition         : setPosition,
    setTofData          : setTofData,
    positioningLoop     : positioningLoop
};