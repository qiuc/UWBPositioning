/**
 * Created by chenqiu on 15/8/22.
 */
var Classes = Object.create(null);

exports.createAnchorCluster = function (config) {
    var AnchorCluster       = loadClass('AnchorCluster');
    var AnchorClusterConfig = loadClass('AnchorClusterConfig');

    return new AnchorCluster({config: new AnchorClusterConfig(config)});
};

exports.createTagCluster = function createTag(config) {
    var TagCluster       = loadClass('TagCluster');
    var TagClusterConfig = loadClass('TagClusterConfig');

    return new TagCluster({config: new TagClusterConfig(config)});
};

function loadClass(className) {
    var Class = Classes[className];

    if(Class !== undefined) {
        return Class;
    }

    switch (className) {
        case 'AnchorCluster':
            Class = require('./AnchorCluster');
            break;
        case 'AnchorClusterConfig':
            Class = require('./AnchorClusterConfig');
            break;
        case 'TagCluster':
            Class = require('./TagCluster');
            break;
        case 'TagClusterConfig':
            Class = require('./TagClusterConfig');
            break;
        default:
            throw new Error('Cannot find class \'' + className + '\'');
    }

    Classes[className] = Class;

    return Class;
}