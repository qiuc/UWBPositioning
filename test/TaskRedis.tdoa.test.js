/**
 * Created by chenqiu on 15/8/24.
 */
var UWBPosition        = require('../');

var anchors = [{
    id: 9,
    timeDelta: '0',
    position: [0, 5.17, -0.66]
},{
    id: 8,
    timeDelta: '2995194320',
    position: [0, 2.709, -0.372]
},{
    id: 11,
    timeDelta: '333375330852',
    position: [1.2, 0, -0.735]
},{
    id: 7,
    timeDelta: '-12769553281',
    position: [3.652, 2.461, -0.339]
},{
    id: 3,
    timeDelta: '245087665582',
    position: [3.647, 5.228, -0.318]
},{
    id: 4,
    timeDelta: '-324060574236',
    position: [3.655, 0.779, -0.633]
}];

var tags = [{
    id: 6
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
