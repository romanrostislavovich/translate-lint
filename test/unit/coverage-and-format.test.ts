import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { ResultCliModel, ICoverageReport } from '../../src/core/models/results/ResultCliModel';
import { ResultModel } from '../../src/core/models/results/ResultModel';
import { ResultErrorModel } from '../../src/core/models/results/ResultErrorModel';
import { ErrorFlow, ErrorTypes } from '../../src/core/enums';

function makeError(type: ErrorTypes = ErrorTypes.error, flow: ErrorFlow = ErrorFlow.keysOnViews): ResultErrorModel {
    return new ResultErrorModel('KEY', flow, type, 'file.html', 'absent.json');
}

function makeCoverage(partial: Partial<ICoverageReport> = {}): ICoverageReport {
    return { totalKeys: 100, usedKeys: 80, unusedKeys: 20, percentage: 80, ...partial };
}

// ── ResultCliModel — coverage ──────────────────────────────────────────────

describe('ResultCliModel — coverage', () => {
    it('should expose coverage passed to constructor', () => {
        const cov = makeCoverage();
        const model = new ResultCliModel([], 0, cov);
        assert.deepEqual(model.coverage, cov);
    });

    it('should default to zero coverage when not provided', () => {
        const model = new ResultCliModel();
        assert.equal(model.coverage.totalKeys, 0);
        assert.equal(model.coverage.percentage, 0);
    });

    it('should carry coverage through getResultModel()', () => {
        const cov = makeCoverage({ percentage: 72 });
        const model = new ResultCliModel([], 0, cov);
        const result = model.getResultModel();
        assert.equal(result.cli.coverage.percentage, 72);
    });
});

// ── ResultModel.printCoverage() ───────────────────────────────────────────

describe('ResultModel.printCoverage()', () => {
    let logStub: sinon.SinonStub;

    beforeEach(() => { logStub = sinon.stub(console, 'log'); });
    afterEach(() => { logStub.restore(); });

    it('should print coverage when totalKeys > 0', () => {
        const cli   = new ResultCliModel([], 0, makeCoverage({ percentage: 80 }));
        const model = new ResultModel(cli);
        model.printCoverage();
        assert.isTrue(logStub.called);
        const printed: string = logStub.firstCall.args[0];
        console.log(logStub.firstCall.args[0]);
        assert.include(printed, '80%');
        assert.include(printed, '80/100');
    });

    it('should not print anything when totalKeys is 0', () => {
        const cli   = new ResultCliModel([], 0, makeCoverage({ totalKeys: 0 }));
        const model = new ResultModel(cli);
        model.printCoverage();
        assert.isFalse(logStub.called);
    });

    it('should print 100% coverage correctly', () => {
        const cli   = new ResultCliModel([], 0, makeCoverage({ usedKeys: 100, unusedKeys: 0, percentage: 100 }));
        const model = new ResultModel(cli);
        model.printCoverage();
        assert.isTrue(logStub.called);
        assert.include(logStub.firstCall.args[0], '100%');
    });

    it('should print coverage for low percentage (< 60)', () => {
        const cli   = new ResultCliModel([], 0, makeCoverage({ usedKeys: 40, unusedKeys: 60, percentage: 40 }));
        const model = new ResultModel(cli);
        model.printCoverage();
        assert.isTrue(logStub.called);
        assert.include(logStub.firstCall.args[0], '40%');
    });
});

// ── ResultModel.toJson() ──────────────────────────────────────────────────

describe('ResultModel.toJson()', () => {
    it('should return an object with errors, summary and coverage', () => {
        const cli  = new ResultCliModel([], 0, makeCoverage());
        const model = new ResultModel(cli);
        const json = model.toJson() as any;

        assert.isArray(json.errors);
        assert.isObject(json.summary);
        assert.isObject(json.coverage);
    });

    it('should map each error to key / errorType / rule / file / message', () => {
        const err  = makeError(ErrorTypes.error, ErrorFlow.keysOnViews);
        const cli  = new ResultCliModel([err], 0, makeCoverage());
        const model = new ResultModel(cli, [], true);
        const json = model.toJson() as any;

        assert.equal(json.errors.length, 1);
        const e = json.errors[0];
        assert.equal(e.key,       'KEY');
        assert.equal(e.errorType, ErrorTypes.error);
        assert.equal(e.rule,      ErrorFlow.keysOnViews);
        assert.equal(e.file,      'file.html');
        assert.isArray(e.message);
    });

    it('summary.total should equal errors + warnings', () => {
        const errs = [
            makeError(ErrorTypes.error),
            makeError(ErrorTypes.warning),
            makeError(ErrorTypes.warning),
        ];
        const cli  = new ResultCliModel(errs, 0, makeCoverage());
        const model = new ResultModel(cli, [], true, true);
        const json = model.toJson() as any;

        assert.equal(json.summary.total,    3);
        assert.equal(json.summary.errors,   1);
        assert.equal(json.summary.warnings, 2);
    });

    it('coverage in JSON should match ResultCliModel.coverage', () => {
        const cov  = makeCoverage({ totalKeys: 50, usedKeys: 35, unusedKeys: 15, percentage: 70 });
        const cli  = new ResultCliModel([], 0, cov);
        const model = new ResultModel(cli);
        const json = model.toJson() as any;

        assert.equal(json.coverage.totalKeys,  50);
        assert.equal(json.coverage.usedKeys,   35);
        assert.equal(json.coverage.unusedKeys, 15);
        assert.equal(json.coverage.percentage, 70);
    });

    it('errors with array message should be preserved as array', () => {
        const misprintErr = new ResultErrorModel('BUTTON.SAV', ErrorFlow.misprintKeys, ErrorTypes.warning, 'view.html', undefined, ['BUTTON.SAVE']);
        const cli  = new ResultCliModel([misprintErr], 0, makeCoverage());
        const model = new ResultModel(cli);
        const json = model.toJson() as any;

        assert.isArray(json.errors[0].message);
    });

    it('should be serialisable to JSON string without throwing', () => {
        const cli  = new ResultCliModel([makeError()], 0, makeCoverage());
        const model = new ResultModel(cli, [], true);
        assert.doesNotThrow(() => JSON.stringify(model.toJson()));
    });
});