/**
 * Created by chenqiu on 15/8/24.
 */
var Task        = require('../lib/Task');
var TaskConfig  = require('../lib/TaskConfig');

var task = new Task({config: new TaskConfig({})});

task.on('listening', function(address) {
    console.log("server listening " + address.address + ":" + address.port);
});

task.on('packet', function(packet) {
    //console.log('Anchor ' + packet.header.anchorId + ' receive packet: ' + packet.payload.name);
});

task.on('anchor_position', function(result) {
    console.log('Anchor positioning complete.');
    //console.log(result);
});

task.on('error', function(err) {
    console.error(err.code);
});

task.run({}, function(anchorCluster) {
    anchorCluster.add({id: 1});
    anchorCluster.add({id: 2});
    anchorCluster.add({id: 3});
    anchorCluster.add({id: 4});

// set anchor distance
    anchorCluster.setDistances('1', {
        "2" : 7.162085,
        "3" : 10.487267,
        "4" : 6.794281
    });

    anchorCluster.setDistances('2', {
        "1" : 7.162085,
        "3" : 6.741098,
        "4" : 10.042475
    });

    anchorCluster.setDistances('3', {
        "1" : 10.487267,
        "2" : 6.741098,
        "4" : 8.324416
    });

    anchorCluster.setDistances('4', {
        "1" : 6.794281,
        "2" : 10.042475,
        "3" : 8.324416
    });

    anchorCluster.positioning({});
});
