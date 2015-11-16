/**
 * Created by chenqiu on 15/11/15.
 */

var Group = require('../../lib/models/Group');

Group.createDefault([], function(err) {
    if(err) console.error(err);
});

Group.create([], function(err) {
    if(err) console.error(err);
});