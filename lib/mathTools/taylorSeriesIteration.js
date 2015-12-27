/**
 * Created by chenqiu on 15/12/26.
 */

var math        = require("./math");
var parser      = math.parser();

var sigma0 = 1;

module.exports = function(pCur, r, p) {
    var M = p.length;

    parser.set('pCur', pCur);
    parser.set('r', r);
    parser.set('S', p);
    parser.set('M', M);
    parser.set('sigma0', sigma0);

    parser.eval('Q = sigma0 * (eye(M-1) + ones(M-1, M-1)) / 2');

    parser.eval('rCur = zeros(M)');
    parser.eval('h1 = zeros(M - 1)');
    parser.eval('pDelta = zeros(M, 3)');
    parser.eval('G1 = zeros(M - 1, 3)');

    for(var j = 1; j <= M; j++) {
        parser.set('j', j);
        parser.eval('rCur[j] = norm(pCur - squeeze(S[j, :]))');
    }

    for(j = 1; j <= M - 1 ; j++) {
        parser.set('j', j);
        parser.eval('h1[j] = r[j] - (rCur[j+1] - rCur[1])');
    }

    for(j = 1; j <= M; j++) {
        parser.set('j', j);
        parser.eval('pDelta[j, :] = squeeze(S[j, :]) - pCur');
    }

    for(j = 1; j <= M - 1 ; j++) {
        for(var k = 1; k <= 3 ; k++) {
            parser.set('j', j);
            parser.set('k', k);
            parser.eval('G1[j, k] = pDelta[1, k] / rCur[1] - pDelta[j+1, k] / rCur[j+1]');
        }
    }

    parser.eval('delta = inv(transpose(G1) * inv(Q) * G1) * transpose(G1) * inv(Q) * h1');

    parser.eval('step = norm(delta)');
    parser.eval('pCur = pCur + 0.5 * delta');
    var step = parser.get('step');
    pCur = parser.get('pCur');

    return { pCur: pCur, step: step };
};