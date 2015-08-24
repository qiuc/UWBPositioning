/**
 * Created by chenqiu on 15/8/24.
 */
var Task        = require('../lib/Task');
var TaskConfig  = require('../lib/TaskConfig');

var task = new Task({config: new TaskConfig({})});

task.run();