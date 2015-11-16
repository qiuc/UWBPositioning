/**
 * Created by chenqiu on 15/11/14.
 */

var redisPool = require('./redis.js');

var index = function(groupId, cb) {
    var group;
    if(!cb && typeof groupId === 'function') {
        cb = groupId;
        group = "anchor:";
    } else {
        group = "group:"+groupId+":anchors";
    }
    redisPool.acquire(function(err, client) {
        if (err) return cb(err);
        client.SMEMBERS(group, function(err,ids) {
            if(err) return cb(err);
            var anchors = [];
            var count = ids.length;
            ids.forEach(function(id) {
                client.HGETALL("anchor:"+id, function(err, result) {
                    if (err) return cb(err);
                    var anchorData = result;
                    client.HGETALL("anchor:"+id+":distances", function(err, result) {
                        if (err) return cb(err);
                        anchorData["distances"] = result;
                        client.GET("anchor:"+id+":position", function(err, result) {
                            if (err) return cb(err);
                            anchorData["position"] = JSON.parse(result);
                            anchors.push(anchorData);
                            count --;
                            if(count === 0) {
                                redisPool.release(client);
                                return cb(null, anchors);
                            }
                        })
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

var create = function(anchor, cb) {
    redisPool.acquire(function(err, client) {
        if(err) return cb(err);
        client.SISMEMBER("anchor:", anchor.id, function(err, result) {
            if(err) return cb(err);
            if(result) {
                var error = new Error("Anchor id is exists");
                error.code = "ANCHOR_ID_EXISTS";
                redisPool.release(client);
                return cb(error);
            }
            var anchorData = {
                id      : anchor.id,
                ip      : anchor.ip || '0.0.0.0',
                port    : anchor.port || '0',
                group   : anchor.group || 'default'
            };
            client.SISMEMBER("group:", anchorData.group, function(err, result) {
                if(err) return cb(err);
                if(!result) {
                    var error = new Error("Anchor group is not exists");
                    error.code = "GROUP_NOT_EXISTS";
                    redisPool.release(client);
                    return cb(error);
                }
                client.SADD("anchor:", anchor.id, function(err) {
                    if(err) return cb(err);
                    client.SADD("group:"+anchorData.group+":anchors", anchor.id, function(err) {
                        if(err) return cb(err);
                        client.HMSET("anchor:" + anchor.id, anchorData, function(err) {
                            redisPool.release(client);
                            return cb(err, anchor.id);
                        });
                    });
                });

            });
        });
    });
};

var show = function(id, cb) {
    redisPool.acquire(function(err, client) {
        if(err) return cb(err);
        client.SISMEMBER("anchor:", id, function(err, result) {
            if (err) return cb(err);
            if (!result) {
                redisPool.release(client);
                var error = new Error("Anchor not found.");
                error.code = "ANCHOR_NOT_FOUND";
                return cb(error);
            }
            client.HGETALL("anchor:"+id, function(err, result) {
                if (err) return cb(err);
                var anchorData = result;
                client.HGETALL("anchor:"+id+":distances", function(err, result) {
                    if (err) return cb(err);
                    anchorData["distances"] = result;
                    client.HGETALL("anchor:"+id+":position", function(err, result) {
                        if (err) return cb(err);
                        anchorData["position"] = JSON.parse(result);
                        redisPool.release(client);
                        return cb(null, anchorData);
                    });
                });
            });
        });
    });
};

var destroy = function(id, cb) {
    redisPool.acquire(function(err, client) {
        if(err) return cb(err);
        client.SISMEMBER("anchor:", id, function(err, result) {
            if (err) return cb(err);
            if (!result) {
                redisPool.release(client);
                var error = new Error("Anchor not found.");
                error.code = "ANCHOR_NOT_FOUND";
                return cb(error);
            }
            client.SREM("anchor:", id, function(err) {
                if (err) return cb(err);
                client.DEL("anchor:"+id, function(err) {
                    if(err) return cb(err);
                    client.DEL("anchor:"+id+":distances", function(err) {
                        if(err) return cb(err);
                        client.DEL("anchor:"+id+":position", function(err) {
                            redisPool.release(client);
                            return cb(err);
                        });
                    });
                });
            });
        });
    });
};

var setDistances = function(id, distances, cb) {
    redisPool.acquire(function(err, client) {
        if(err) return cb(err);
        client.SISMEMBER("anchor:", id, function(err, result) {
            if (err) return cb(err);
            if (!result) {
                redisPool.release(client);
                var error = new Error("Anchor not found.");
                error.code = "ANCHOR_NOT_FOUND";
                return cb(error);
            }
            client.HMSET("anchor:" + id + ":distances", distances, function(err) {
                redisPool.release(client);
                return cb(err);
            });
        });
    });
};

var setPosition = function(id,position, cb) {
    redisPool.acquire(function(err, client) {
        if(err) return cb(err);
        client.SISMEMBER("anchor:", id, function(err, result) {
            if (err) return cb(err);
            if (!result) {
                redisPool.release(client);
                var error = new Error("Anchor not found.");
                error.code = "ANCHOR_NOT_FOUND";
                return cb(error);
            }
            client.SET("anchor:" + id + ":position", JSON.stringify(position), function(err) {
                redisPool.release(client);
                return cb(err);
            });
        });
    });
};

var isPositioned = function(id, cb) {
    redisPool.acquire(function(err, client) {
        client.EXISTS("anchor:"+id+":position", function(err, result){
            redisPool.release(client);
            return cb(err, result);
        });
    });
};

var clearAllPositions = function(groupId, position, cb) {
    var group;
    if(!cb && typeof groupId === 'function') {
        cb = groupId;
        group = "anchor:";
    } else {
        group = "group:"+groupId+":anchors";
    }
    redisPool.acquire(function(err, client) {
        if (err) return cb(err);
        client.SMEMBERS(group, function(err,ids) {
            if(err) return cb(err);
            var count = ids.length;
            ids.forEach(function(id) {
                client.DEL("anchor:"+id+":position", function(err) {
                    if(err) return cb(err);
                    count --;
                    if(count === 0) {
                        redisPool.release(client);
                        return cb(null, ids);
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

/*
AnchorCluster.prototype.positioning = function positioning(config) {
    var nodes = this._nodes;
    var nodeIds = Object.keys(nodes);
    var positions = {};

    var settings = {
        initPosition:   config.initPosition || [0, 0],
        initAngle:      config.initAngle || 0,
        isMirror:       typeof config.isMirror === 'undefined' ? false : config.isMirror
    };

    if (nodeIds.length != 4) {
        throw new Error('Anchor number is must be equal to 4 when positioning in this version');
    }

    var AnchorCluster = this;

    async.retry(this.config.maxRetryTimes,
        function(cb) {
            async.reduce(nodeIds, positions, function(memo, nodeId, cb) {
                var node = nodes[nodeId];
                try {
                    positions = node.anchor.positioning(positions, settings);
                    async.setImmediate(function() {
                        cb(null, positions);
                    });
                } catch (err) {
                    async.setImmediate(function() {
                        cb(err);
                    });
                }
            }, function(err, result){
                if(err)  return cb(err);

                if(Object.keys(result).length < nodeIds.length) {
                    console.log(result);
                    err = new Error("Only " + Object.keys(result).length + " anchors positioning complete.");
                    err.code = "ANCHORCLUSTER_POSITION_FAILED";
                    cb(err);
                } else {
                    cb(null, result);
                }

            })
        }, function(err, result) {
            if(err) {
                AnchorCluster.emit('error', err);
                return;
            }

            AnchorCluster.emit('position', result);
        }
    );
};

Anchor.prototype.positioning = function (positions, settings) {

    if(positions[this.config.id] != undefined)
        return positions;

    if (this.position.length === 0) {
        var positionIds = Object.keys(positions);
        var distanceIds = Object.keys(this.distances);

        var validIds = distanceIds.filter(function(v){ return positionIds.indexOf(v) > -1 });

        switch(validIds.length) {
            case 0:
                this.position = settings.initPosition;
                break;
            case 1:
                if(validIds.length === 1) {
                    //todo: calc the second position with init angle
                    var p1 = positions[validIds[0]];
                    var d1 = this.distances[validIds[0]];
                    this.position = [p1[0],p1[1] + d1];
                }
                break;
            case 2:
                if(validIds.length === 2) {
                    var p1 = positions[validIds[0]];
                    var p2 = positions[validIds[1]];
                    var d1 = this.distances[validIds[0]];
                    var d2 = this.distances[validIds[1]];
                    if(d1 > 0 && d2 > 0) {
                        this.position = mathTools.trilateration(p1, p2, d1, d2, 0.05, settings.isMirror);
                    }
                }
                break;

            default:
                if(validIds.length >= 3) {
                    var p1 = positions[validIds[0]];
                    var p2 = positions[validIds[1]];
                    var p3 = positions[validIds[2]];
                    var d1 = this.distances[validIds[0]];
                    var d2 = this.distances[validIds[1]];
                    var d3 = this.distances[validIds[2]];
                    if(d1 > 0 && d2 > 0) {
                        var p41 = mathTools.trilateration(p1, p2, d1, d2, 0.05, false);
                        var p42 = mathTools.trilateration(p1, p2, d1, d2, 0.05, true);

                        if(Math.abs(Math.pow(p41[0] - p3[0], 2) + Math.pow(p41[1] - p3[1], 2) - Math.pow(d3, 2))
                            < Math.abs(Math.pow(p42[0] - p3[0], 2) + Math.pow(p42[1] - p3[1], 2) - Math.pow(d3, 2))) {
                            this.position = p41;
                        } else {
                            this.position = p42;
                        }
                    }
                }
                break;
        }
    }

    if(this.position.length > 0) {
        positions[this.config.id] = this.position;
    }
    return positions;
};
*/
module.exports = {
    index               : index,
    create              : create,
    show                : show,
    destroy             : destroy,
    setDistances        : setDistances,
    setPosition         : setPosition,
    isPositioned        : isPositioned,
    clearAllPositions   : clearAllPositions
};