/**
 * Created by chenqiu on 15/8/22.
 */
var Classes = Object.create(null);

exports.createTask = function (config) {
    var Task       = loadClass('Task');
    var TaskConfig = loadClass('TaskConfig');

    return new Task({config: new TaskConfig(config)});
};

function loadClass(className) {
    var Class = Classes[className];

    if(Class !== undefined) {
        return Class;
    }

    switch (className) {
        case 'Task':
            Class = require('./lib/Task');
            break;
        case 'TaskConfig':
            Class = require('./lib/TaskConfig');
            break;
        default:
            throw new Error('Cannot find class \'' + className + '\'');
    }

    Classes[className] = Class;

    return Class;
}