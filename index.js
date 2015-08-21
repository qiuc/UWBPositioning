/**
 * Created by chenqiu on 15/8/8.
 */

var Classes = Object.create(null);

exports.createAnchor = function createAnchor(config) {
    var Anchor       = loadClass('Anchor');
    var AnchorConfig = loadClass('AnchorConfig');

    return new Anchor({config: new AnchorConfig(config)});
};

function loadClass(className) {
    var Class = Classes[className];

    if(Class !== undefined) {
        return Class;
    }

    switch (className) {
        case 'Anchor':
            Class = require('./lib/Anchor');
            break;
        case 'AnchorConfig':
            Class = require('./lib/AnchorConfig');
            break;
        default:
            throw new Error('Cannot find class \'' + className + '\'');
    }

    Classes[className] = Class;
}