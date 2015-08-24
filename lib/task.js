/**
 * Created by chenqiu on 15/8/24.
 */

var dgram           = require('dgram');
var Protocol        = require('./protocol/Protocol');
var EventEmitter    = require("events").EventEmitter;
var Util            = require("util");

module.exports = Task;
Util.inherits(Task, EventEmitter);
function Task(options) {
    EventEmitter.call(this);

    this.config = options.config;

    this._socket        = null;
    this._protocol      = new Protocol({config: this.config, task: this});
    this._runCalled     = false;
    this.state          = 'idle';
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

    if(!this._runCalled) {
        this._runCalled = true;

        this._socket = dgram.createSocket("udp4");

        var task = this;

        this._protocol.on('data', function(data, rinfo) {
            task._socket.send(data, 0, data.length, rinfo.port, rinfo.address);
        });

        this._socket.on('message', function (msg, rinfo) {
            //console.log("server got: " + msg.toString("hex") + " from " +
            //rinfo.address + ":" + rinfo.port);
            task._protocol.write(msg, rinfo);
        });

        this._socket.on('error', this._handleNetworkError.bind(this));
        this._socket.on('listening', this._handleProtocolListening.bind(this));
        this._protocol.on('unhandledError', this._handleProtocolError.bind(this));
        this._protocol.on('end', this._handleProtocolEnd.bind(this));
        this._protocol.on('enqueue', this._handleProtocolEnqueue.bind(this));

        this._socket.bind(this.config.port);
    }
};

Task.prototype.destroy = function() {
    this.state = 'idle';
    this._implyRun();
    this._socket.close();
    this._protocol.destroy();
};

Task.prototype.pause = function() {
    this._protocol.pause();
};

Task.prototype.resume = function() {
    this._protocol.resume();
};

Task.prototype._handleNetworkError = function(err) {
    this._protocol.handleNetworkError(err);
};

Task.prototype._handleProtocolError = function(err) {
    this.state = "protocol_error";
    this.emit('error', err);
};

Task.prototype._handleProtocolListening = function() {
    this.state = "listening";
    this.emit('listening');
};

Task.prototype._handleProtocolEnd = function(err) {
    this.state = "idle";
    this.emit('end', err);
};

Task.prototype._handleProtocolEnqueue = function(sequence) {
    this.emit('enqueue', sequence);
};

Task.prototype._implyRun = function() {
    if(!this._runCalled) {
        this.run();
    }
};