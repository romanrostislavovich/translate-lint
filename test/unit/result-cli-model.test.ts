import 'mocha';
import { assert } from 'chai';
import { ResultCliModel } from '../../src/core/models/results/ResultCliModel';
import { ResultErrorModel } from '../../src/core/models/results/ResultErrorModel';
import { ErrorFlow, ErrorTypes, StatusCodes } from '../../src/core/enums';

function makeError(type: ErrorTypes, flow: ErrorFlow = ErrorFlow.keysOnViews): ResultErrorModel {
    return new ResultErrorModel('KEY', flow, type, 'file.html');
}

describe('ResultCliModel', () => {
    it('should initialise with empty errors', () => {
        const model = new ResultCliModel();
        assert.equal(model.errors.length, 0);
        assert.equal(model.countWarnings(), 0);
        assert.equal(model.countErrors(), 0);
    });

    it('should count warnings correctly', () => {
        const model = new ResultCliModel([
            makeError(ErrorTypes.warning),
            makeError(ErrorTypes.warning),
            makeError(ErrorTypes.error),
        ]);
        assert.equal(model.countWarnings(), 2);
        assert.isTrue(model.hasWarnings());
    });

    it('should count errors correctly', () => {
        const model = new ResultCliModel([makeError(ErrorTypes.error)]);
        assert.equal(model.countErrors(), 1);
        assert.isTrue(model.hasErrors());
    });

    it('should count misprintKeys', () => {
        const model = new ResultCliModel([makeError(ErrorTypes.warning, ErrorFlow.misprintKeys)]);
        assert.equal(model.countMisprint(), 1);
        assert.isTrue(model.hasMisprint());
    });

    it('should collect empty keys separately', () => {
        const model = new ResultCliModel([
            makeError(ErrorTypes.warning, ErrorFlow.emptyKeys),
            makeError(ErrorTypes.warning, ErrorFlow.keysOnViews),
        ]);
        assert.equal(model.countEmptyKeys(), 1);
        assert.isTrue(model.hasEmptyKeys());
        assert.equal(model.getEmptyKeys()[0].errorFlow, ErrorFlow.emptyKeys);
    });

    it('isFullOfWarning should be false when warnings <= maxCountWarning', () => {
        const model = new ResultCliModel([makeError(ErrorTypes.warning)], 5);
        assert.isFalse(model.isFullOfWarning());
    });

    it('isFullOfWarning should be true when warnings > maxCountWarning', () => {
        const model = new ResultCliModel([
            makeError(ErrorTypes.warning),
            makeError(ErrorTypes.warning),
            makeError(ErrorTypes.warning),
        ], 2);
        assert.isTrue(model.isFullOfWarning());
    });

    it('exitCode should be successful when no errors', () => {
        const model = new ResultCliModel([makeError(ErrorTypes.warning)], 100);
        assert.equal(model.exitCode(), StatusCodes.successful);
    });

    it('exitCode should be error when errors exist', () => {
        const model = new ResultCliModel([makeError(ErrorTypes.error)]);
        assert.equal(model.exitCode(), StatusCodes.error);
    });

    it('hasErrors should be true when isFullOfWarning', () => {
        const model = new ResultCliModel([
            makeError(ErrorTypes.warning),
            makeError(ErrorTypes.warning),
        ], 1);
        assert.isTrue(model.hasErrors());
    });

    it('getResultModel should return a ResultModel instance', () => {
        const model  = new ResultCliModel([makeError(ErrorTypes.warning)]);
        const result = model.getResultModel();
        assert.exists(result);
    });
});