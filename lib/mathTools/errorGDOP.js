/**
 * Created by chenqiu on 15/12/26.
 */

var math        = require("./math");
var parser      = math.parser();

module.exports = function(pCur, r, p) {
    var M = p.length;

    parser.set('pCur', pCur);
    parser.set('r', r);
    parser.set('S', p);
    parser.set('M', M);

    parser.eval('rCur = zeros(M)');
    parser.eval('h1 = zeros(M - 1)');
    parser.eval('pDelta = zeros(M, 3)');
    parser.eval('G1 = zeros(M - 1, 3)');

    for(var j = 1; j <= M; j++) {
        parser.set('j', j);
        parser.eval('rCur[j] = norm(pCur - squeeze(S[j, :]))');
    }

    parser.eval('err = 0');
    for(j = 1; j <= M - 1 ; j++) {
        parser.set('j', j);
        parser.eval('err = err + (r[j] - (rCur[j+1] - rCur[1]))^2 / (M - 1)');
    }
    parser.eval('err = sqrt(err)');

    parser.eval('A = zeros(3, M)');
    for(j = 1; j <= M ; j++) {
        for(var k = 1; k <= 3 ; k++) {
            parser.set('j', j);
            parser.set('k', k);
            parser.eval('A[k, j] = (pCur[k] - S[j, k]) / rCur[j]');
        }
    }

    parser.eval('GDOP = sqrt(trace(inv(A * transpose(A))))');
    parser.eval('errGDOP = err * GDOP');

    var err = parser.get('err');
    var GDOP = parser.get('GDOP');
    var errGDOP = parser.get('errGDOP');

    parser.clear();

    return { err: err, GDOP: GDOP, errGDOP: errGDOP };
};