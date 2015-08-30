/**
 * Created by chenqiu on 15/8/29.
 */
var math        = require("./math").parser();

module.exports = function(c1, r1, c2, r2) {
    math.set('x1', c1[0]);
    math.set('y1', c1[1]);
    math.set('r1', r1);
    math.set('x2', c2[0]);
    math.set('y2', c2[1]);
    math.set('r2', r2);

    var result;
    var condition;
    math.eval('d12 = sqrt((x1 - x2)^2 + (y1 - y2)^2)');
    if(math.eval('d12 > r1 + r2')) {
        math.eval('deltaX = x2 - x1');
        math.eval('deltaY = y2 - y1');
        math.eval('xo1 = x1 + deltaX * r1 / d12');
        math.eval('yo1 = y1 + deltaY * r1 / d12');
        math.eval('xo2 = x2 - deltaX * r2 / d12');
        math.eval('yo2 = y2 - deltaY * r2 / d12');
        result = [[math.get('xo1'), math.get('yo1')], [math.get('xo2'), math.get('yo2')]];
        condition = 0;
    } else if(math.eval('d12 < abs(r1 - r2)')) {
        var swap = false;
        if(math.eval('r1 < r2')) {
            math.set('x1', c2[0]);
            math.set('y1', c2[1]);
            math.set('r1', r2);
            math.set('x2', c1[0]);
            math.set('y2', c1[1]);
            math.set('r2', r1);
            swap = true;
        }

        math.eval('deltaX = x2 - x1');
        math.eval('deltaY = y2 - y1');
        math.eval('xo1 = x1 + deltaX * r1 / d12');
        math.eval('yo1 = y1 + deltaY * r1 / d12');
        math.eval('xo2 = x1 + deltaX * (d12 + r2) / d12');
        math.eval('yo2 = y1 + deltaY * (d12 + r2) / d12');

        if(swap) {
            result = [[math.get('xo1'), math.get('yo1')], [math.get('xo2'), math.get('yo2')]];
        } else {
            result = [[math.get('xo2'), math.get('yo2')], [math.get('xo1'), math.get('yo1')]];
        }

        condition = 0;
    } else {
        if(math.eval('abs(y2 - y1) < 0.001')) {
            math.eval('xo1 = xo2 = (r1^2 - r2^2 + x2^2 + y2^2 - x1^2 - y1^2) / 2 / (x2 - x1)');
            math.eval('temp = sqrt(r1^2 - (xo1 - x1)^2)');
            if(math.eval('temp < 0.005')) {
                result = [[math.get('xo1'), math.get('y1')], [math.get('xo2'), math.get('y1')]];
                condition = 1;
            } else {
                math.eval('yo1 = y1 + temp');
                math.eval('yo2 = y1 - temp');
                result = [[math.get('xo1'), math.get('yo1')], [math.get('xo2'), math.get('yo2')]];
                condition = 2;
            }
        } else {
            math.eval('k = (x1 - x2) / (y2 - y1)');
            math.eval('d = (r1^2 - r2^2 + x2^2 + y2^2 - x1^2 - y1^2) / 2 / (y2 - y1)');

            math.eval('a = 1 + k^2');
            math.eval('b = -2 * x1 + 2 * k * (d - y1)');
            math.eval('c = x1^2 + (d - y1)^2 - r1^2');
            math.eval('temp = sqrt(b^2 - 4 * a * c)');
            math.eval('xo1 = (- b + temp) / (2 * a)');
            math.eval('xo2 = (- b - temp) / (2 * a)');
            math.eval('yo1 = k * xo1 + d');
            math.eval('yo2 = k * xo2 + d');
            result = [[math.get('xo1'), math.get('yo1')], [math.get('xo2'), math.get('yo2')]];
            if(math.eval('temp < 0.005')) {
                condition = 1;
            } else {
                condition = 2;
            }
        }
    }

    if(condition === 0 || condition  === 1) {
        result = [(result[0][0] + result[1][0])/2, (result[0][1] + result[1][1])/2 ];
    }

    math.clear();
    return result;
};