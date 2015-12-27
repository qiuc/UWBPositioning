/**
 * Created by chenqiu on 15/8/24.
 */

//var deviceFactory   = require('./deviceFactory');
var Protocol        = require('./protocol/Protocol');
var dgram           = require('dgram');
var EventEmitter    = require("events").EventEmitter;
var Util            = require("util");

var POSITION_INTERVAL = 20;

module.exports = Task;
Util.inherits(Task, EventEmitter);
function Task(options) {
    EventEmitter.call(this);

    this.config = options.config;

    //load model
    this.Group  = require('./models/Group');
    this.Anchor = require('./models/Anchor');
    this.Tag    = require('./models/Tag');

    this._socket            = null;
    this._protocol          = new Protocol({config: this.config, task: this});
    this._positionInterval  = function(){};
    //this._anchorCluster = deviceFactory.createAnchorCluster(options.anchorClusterOptions || {});
    //this._tagCluster    = deviceFactory.createTagCluster(options.tagClusterOptions || {}, this._anchorCluster);
    this.state              = 'idle';
}

function bindToCurrentDomain(callback) {
    if(!callback) return;

    var domain = process.domain;

    return domain
        ? domain.bind(callback)
        : callback;
}

Task.prototype.run = function (options, callback) {
    if(!callback && typeof options === 'function') {
        callback = options;
        options = {};
    }

    if(this.state === 'idle') {

        this._socket = dgram.createSocket("udp4");

        var task = this;

        this._protocol.on('data', function(data, rinfo) {
            task._socket.send(data, 0, data.length, rinfo.port, rinfo.address);
        });

        this._socket.on('message', function (msg, rinfo) {
            task._protocol.write(msg, rinfo);
        });

        this._socket.on('error', this._handleNetworkError.bind(this));
        this._socket.on('listening', this._handleProtocolListening.bind(this));

        this._socket.bind(this.config.port);

        this._protocol.on('error', this._handleProtocolError.bind(this));
        this._protocol.on('packet', this._handleProtocolPacket.bind(this));

        this._protocol.run();

        this.Group.createDefault({}, function(err) {
            if(err) task.emit('error', err);
        });

        this._positionInterval = setInterval(function() {
            task.Tag.positioningLoop(function(err, data) {
                if(err) task.emit('error', err);
                else    task.emit('tag_position', data);
            });
        }, POSITION_INTERVAL);
/*
        this._anchorCluster.on('error', this._handleAnchorError.bind(this));
        this._anchorCluster.on('position', this._handleAnchorPosition.bind(this));

        this._tagCluster.on('error', this._handleTagError.bind(this));
        this._tagCluster.on('position', this._handleTagPosition.bind(this));

        this._tagCluster.run({});*/
    }

    process.nextTick(function() {
        callback();
        //callback(task._anchorCluster);
    });
};

Task.prototype.stop = function() {
    this.state = 'idle';
    this._socket.close();
    this._protocol.stop();
    clearInterval(this._positionInterval);
};

Task.prototype.pause = function() {
    this._protocol.pause();
};

Task.prototype.resume = function() {
    this._protocol.resume();
};

Task.prototype._handleNetworkError = function(err) {
    this.state = 'idle';
    this._socket.close();
    this._protocol.handleNetworkError(err);
    this.emit('error', err);
};

Task.prototype._handleProtocolError = function(err) {
    this.emit('error', err);
};

Task.prototype._handleProtocolListening = function() {
    this.state = "listening";
    var address = this._socket.address();
    this.emit('listening', address);
};

Task.prototype._handleProtocolPacket = function(packet) {
    this.emit('packet', packet);

    var task = this;

    // Check if anchor has position
    // Meanwhile some anchor settings may add to the payload for farther process
    task.Anchor.processPacket(packet, function(err, packet) {
        if(err) return task.emit('error', err);
        if(!packet) return;
        task.Tag.setPositionData(packet.payload.name, packet.header.anchorId, packet.payload, function(err) {
            if(err) task.emit('error', err);
        });
    });
};
/*
Task.prototype._handleAnchorPosition = function (positions) {
    this.emit('anchor_position', positions);
};

Task.prototype._handleAnchorError = function (err) {
    this.emit('error', err);
};

Task.prototype._handleTagPosition = function (positions) {
    this.emit('tag_position', positions);
};

Task.prototype._handleTagError = function (err) {
    this.emit('error', err);
};
*/
Task.prototype.ping = function ping(options, callback) {
    if(!callback && typeof options === 'function') {
        callback = options;
        options = {};
    }

    if(this.status === 'idle') {
        var err = new Error("The task is stopped.");
        err.code = "TASK_STOPPED";
        callback(err);
        return;
    }

    this._protocol.ping(options, bindToCurrentDomain(callback));
};
