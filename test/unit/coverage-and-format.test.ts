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
    let writeStub: sinon.SinonStub;

    beforeEach(() => { writeStub = sinon.stub(process.stdout, 'write'); });
    afterEach(() => { writeStub.restore(); });

    it('should print coverage when totalKeys > 0', () => {
        const cli   = new ResultCliModel([], 0, makeCoverage({ percentage: 80 }));
        const model = new ResultModel(cli);
        model.printCoverage();
        assert.isTrue(writeStub.called);
        const printed: string = writeStub.firstCall.args[0] as string;
        assert.include(printed, '80%');
        assert.include(printed, '80/100');
    });

    it('should not print anything when totalKeys is 0', () => {
        const cli   = new ResultCliModel([], 0, makeCoverage({ totalKeys: 0 }));
        const model = new ResultModel(cli);
        model.printCoverage();
        assert.isFalse(writeStub.called);
    });

    it('should print 100% coverage correctly', () => {
        const cli   = new ResultCliModel([], 0, makeCoverage({ usedKeys: 100, unusedKeys: 0, percentage: 100 }));
        const model = new ResultModel(cli);
        model.printCoverage();
        assert.isTrue(writeStub.called);
        assert.include(writeStub.firstCall.args[0] as string, '100%');
    });

    it('should print coverage for low percentage (< 60)', () => {
        const cli   = new ResultCliModel([], 0, makeCoverage({ usedKeys: 40, unusedKeys: 60, percentage: 40 }));
        const model = new ResultModel(cli);
        model.printCoverage();
        assert.isTrue(writeStub.called);
        assert.include(writeStub.firstCall.args[0] as string, '40%');
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

    it('should include stats block when elapsed is provided', () => {
        const cli   = new ResultCliModel([], 0, makeCoverage({ totalKeys: 42 }));
        cli.viewFiles = 3;
        cli.languageFiles = 2;
        const model = new ResultModel(cli);
        const json  = model.toJson(500) as any;

        assert.isObject(json.stats);
        assert.equal(json.stats.viewFiles,     3);
        assert.equal(json.stats.languageFiles, 2);
        assert.equal(json.stats.elapsedMs,     500);
    });

    it('should NOT include stats block when elapsed is not provided', () => {
        const cli  = new ResultCliModel([], 0, makeCoverage());
        const model = new ResultModel(cli);
        const json  = model.toJson() as any;
        assert.isUndefined(json.stats);
    });
});

// ── ResultModel.toJunit() ─────────────────────────────────────────────────

describe('ResultModel.toJunit()', () => {
    it('should return a valid XML declaration', () => {
        const cli   = new ResultCliModel([], 0, makeCoverage());
        const model = new ResultModel(cli);
        const xml   = model.toJunit();
        assert.include(xml, '<?xml version="1.0" encoding="UTF-8"?>');
    });

    it('should wrap output in <testsuites> element', () => {
        const cli   = new ResultCliModel([], 0, makeCoverage());
        const model = new ResultModel(cli);
        const xml   = model.toJunit();
        assert.include(xml, '<testsuites');
        assert.include(xml, '</testsuites>');
    });

    it('should create one <testsuite> per unique file', () => {
        const err1 = new ResultErrorModel('KEY1', ErrorFlow.keysOnViews, ErrorTypes.error, 'a.html', 'en.json');
        const err2 = new ResultErrorModel('KEY2', ErrorFlow.keysOnViews, ErrorTypes.error, 'b.html', 'en.json');
        const cli   = new ResultCliModel([err1, err2], 0, makeCoverage());
        const model = new ResultModel(cli, [], true);
        const xml   = model.toJunit();
        const suiteMatches = xml.match(/<testsuite /g) || [];
        assert.equal(suiteMatches.length, 2);
    });

    it('should group errors from the same file in one <testsuite>', () => {
        const err1 = new ResultErrorModel('KEY1', ErrorFlow.keysOnViews, ErrorTypes.error, 'same.html', 'en.json');
        const err2 = new ResultErrorModel('KEY2', ErrorFlow.keysOnViews, ErrorTypes.error, 'same.html', 'en.json');
        const cli   = new ResultCliModel([err1, err2], 0, makeCoverage());
        const model = new ResultModel(cli, [], true);
        const xml   = model.toJunit();
        const suiteMatches = xml.match(/<testsuite /g) || [];
        assert.equal(suiteMatches.length, 1);
        assert.include(xml, 'tests="2"');
    });

    it('should include <testcase> and <failure> for each error', () => {
        const err = new ResultErrorModel('MY.KEY', ErrorFlow.keysOnViews, ErrorTypes.error, 'view.html', 'en.json');
        const cli   = new ResultCliModel([err], 0, makeCoverage());
        const model = new ResultModel(cli, [], true);
        const xml   = model.toJunit();
        assert.include(xml, '<testcase');
        assert.include(xml, '<failure');
        assert.include(xml, 'MY.KEY');
    });

    it('should escape XML special characters in key names', () => {
        const err = new ResultErrorModel('K<E>"Y&', ErrorFlow.keysOnViews, ErrorTypes.error, 'view.html', 'en.json');
        const cli   = new ResultCliModel([err], 0, makeCoverage());
        const model = new ResultModel(cli, [], true);
        const xml   = model.toJunit();
        assert.include(xml, 'K&lt;E&gt;&quot;Y&amp;');
        assert.notInclude(xml, 'K<E>');
    });

    it('should produce valid output with no errors', () => {
        const cli   = new ResultCliModel([], 0, makeCoverage());
        const model = new ResultModel(cli);
        const xml   = model.toJunit();
        assert.include(xml, 'tests="0"');
        assert.notInclude(xml, '<testsuite ');
    });
});

// ── ResultModel.printStats() ──────────────────────────────────────────────

describe('ResultModel.printStats()', () => {
    let writeStub: sinon.SinonStub;

    beforeEach(() => { writeStub = sinon.stub(process.stdout, 'write'); });
    afterEach(() => { writeStub.restore(); });

    it('should print file counts and elapsed time', () => {
        const cli   = new ResultCliModel([], 0, makeCoverage({ totalKeys: 50 }));
        cli.viewFiles = 5;
        cli.languageFiles = 3;
        const model = new ResultModel(cli);
        model.printStats(1500);
        assert.isTrue(writeStub.called);
        const printed: string = writeStub.firstCall.args[0] as string;
        assert.include(printed, '5');
        assert.include(printed, '3');
        assert.include(printed, '1.500s');
        assert.include(printed, '50');
    });

    it('should format time with 3 decimal places', () => {
        const cli   = new ResultCliModel([], 0, makeCoverage());
        const model = new ResultModel(cli);
        model.printStats(250);
        const printed: string = writeStub.firstCall.args[0] as string;
        assert.include(printed, '0.250s');
    });
});