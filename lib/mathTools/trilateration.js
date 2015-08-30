/**
 * Created by chenqiu on 15/8/7.
 */

var math = require("./math").parser();

module.exports = function(p1, p2, d13, d23, tolr, mirror) {
    var err;

    math.set('x1', p1[0]);
    math.set('y1', p1[1]);
    math.set('x2', p2[0]);
    math.set('y2', p2[1]);
    math.set('d13', d13);
    math.set('d23', d23);
    math.set('tolr', tolr);
    math.set('mirror', mirror);

    math.eval('d12 = sqrt((x1 - x2)^2 + (y1 - y2)^2)');

    if(math.eval("d13 + d23 < d12")) {
        math.eval("d13 = d13 + (d13 + d23 - d12) / 2");
        math.eval("d23 = d23 + (d13 + d23 - d12) / 2");
    } else if(math.eval("d13 - d23 > d12")) {
        math.eval("d13 = d13 - (d13 - d23 - d12) / 2");
        math.eval("d23 = d23 + (d13 - d23 - d12) / 2");
    } else if(math.eval("d23 - d13 > d12")) {
        math.eval("d13 = d13 + (d23 - d13 - d12) / 2");
        math.eval("d23 = d23 - (d23 - d13 - d12) / 2");
    }

    if(math.eval("y2 == y1")) {
        math.eval("x3 = (d23^2 - d13^2 + x1^2 - x2^2) / (x1 - x2) / 2");
        math.eval("a = 1");
        math.eval("b = 0 - 2 * y1");
        math.eval("c = y1^2 + (x3 - x1)^2 - d13^2");
        math.eval("temp = b^2 - 4 * a * c");
        if(math.eval("temp < 0")) {
            if(math.eval("abs(temp) < tolr")) {
                math.eval("temp = 0");
            } else {
                math.eval("y3 = y1");
                err = new Error("Trilateration calculate failed");
                err.code = "MATHTOOL_TRILATERATION_FAILED";
                throw err;
            }
        }

        math.eval("y3 = mirror ? (0 - b - sqrt(temp) / 2 / a) : (0 - b + sqrt(temp) / 2 / a)");
    } else {
        math.eval("k = (x2 - x1) / (y1 - y2)");
        math.eval("d = d23^2 - d13^2 + x1^2 +y1^2 - x2^2 - y2^2");
        math.eval("d = d / (y1 - y2) / 2");
        math.eval("a = 1 + k^2");
        math.eval("b = -2 * x1 + 2 * k * (d - y1)");
        math.eval("c = x1 ^ 2 + (d - y1)^2 - d13^2");
        math.eval("temp = b^2 - 4 * a * c");
        if(math.eval("temp < 0")) {
            if(math.eval("abs(temp) < tolr")) {
                math.eval("temp = 0");
            } else {
                err = new Error("Trilateration calculate failed");
                err.code = "MATHTOOL_TRILATERATION_FAILED";
                throw err;
            }
        }

        math.eval("x3 = mirror ? (0 - b - sqrt(temp) / 2 / a) : (0 - b + sqrt(temp) / 2 / a)");
        math.eval("y3 = x3 * k + d");
    }

    var x3 = math.get('x3');
    var y3 = math.get('y3');

    math.clear();
    return [x3, y3];
};