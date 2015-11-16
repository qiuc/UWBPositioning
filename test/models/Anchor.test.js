/**
 * Created by chenqiu on 15/11/14.
 */

var Anchor = require('../../lib/models/Anchor');

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


var count = anchors.length;
anchors.forEach(function(anchor) {
    Anchor.create(anchor, function(err) {
        if(err) console.error(err);
        Anchor.setDistances(anchor.id, anchor.distances, function(err) {
            if(err) console.error(err);
            Anchor.setPosition(anchor.id, anchor.position, function(err) {
                console.log(anchor.position);
                if(err) console.error(err);
                count--;
                if(count === 0)  {
                    Anchor.index("default", function(err, result) {
                        if(err) return console.error(err);

                        console.log(result);
                    });
                }
            });
        });
    });
});

/*
Anchor.index("default", function(err, result) {
    if(err) return console.error(err);

    console.log(result);
});*/