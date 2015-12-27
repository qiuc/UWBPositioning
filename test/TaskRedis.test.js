/**
 * Created by chenqiu on 15/8/24.
 */
var UWBPosition        = require('../');

var anchors = [{
    id: 1,
    distances: {
        "2" : 7.162085,
        "3" : 10.487267,
        "4" : 6.794281
    },
    position: [0,0]
},{
    id: 2,
    distances: {
        "1" : 7.162085,
        "3" : 6.741098,
        "4" : 10.042475
    },
    position: [0, 7.162085]
},{
    id: 3,
    distances: {
        "1" : 10.487267,
        "2" : 6.741098,
        "4" : 8.324416
    },
    position: [6.677380974400725, 8.086739296651043]
},{
    id: 4,
    distances: {
        "1" : 6.794281,
        "2" : 10.042475,
        "3" : 8.324416
    },
    position: [6.790149212854243, -0.2369134317338452]
}];

var tags = [{
    id: 5
}];

var task = UWBPosition.createTask({});

task.on('listening', function(address) {
    console.log("server listening " + address.address + ":" + address.port);
});

task.on('packet', function(packet) {
    //console.log('Anchor ' + packet.header.anchorId + ' receive packet: ' + packet.payload.name);
});

task.on('anchor_position', function(result) {
    console.log('Anchor positioning complete.');
    console.log(result);
});

task.on('tag_position', function(result) {
    console.log(result);
});

task.on('error', function(err) {
    console.dir(err);
});

task.run({}, function() {
    var anchorCnt = anchors.length;
    var tagCnt = tags.length;
    var Anchor = task.Anchor;
    var Tag = task.Tag;
    anchors.forEach(function(anchor) {
        Anchor.create(anchor, function(err) {
            if(err) console.error(err);
            Anchor.setDistances(anchor.id, anchor.distances, function(err) {
                if(err) console.error(err);
                Anchor.setPosition(anchor.id, anchor.position, function(err) {
                    if(err) console.error(err);
                    anchorCnt--;
                    if(anchorCnt === 0)  {
                        Anchor.index("default", function(err, result) {
                            if(err) return console.error(err);

                            console.log(result);
                        });
                    }
                });
            });
        });
    });

    tags.forEach(function(tag) {
        Tag.create(tag, function(err) {
            if(err) console.error(err);
            tagCnt--;
            if(tagCnt === 0)  {
                Tag.index(function(err, result) {
                    if(err) return console.error(err);

                    console.log(result);
                });
            }
        });
    });
});
