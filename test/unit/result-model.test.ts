import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { ResultModel } from '../../src/core/models/results/ResultModel';
import { ResultCliModel } from '../../src/core/models/results/ResultCliModel';
import { ResultFileModel } from '../../src/core/models/results/ResultFileModel';
import { ResultErrorModel } from '../../src/core/models/results/ResultErrorModel';
import { ErrorFlow, ErrorTypes } from '../../src/core/enums';

function makeError(type: ErrorTypes, flow: ErrorFlow = ErrorFlow.keysOnViews): ResultErrorModel {
    return new ResultErrorModel('KEY', flow, type, 'file.html');
}

describe('ResultModel', () => {
    let errorStub: sinon.SinonStub;
    let logStub: sinon.SinonStub;

    beforeEach(() => {
        errorStub = sinon.stub(console, 'error');
        logStub   = sinon.stub(console, 'log');
    });

    afterEach(() => {
        errorStub.restore();
        logStub.restore();
    });

    it('should construct with defaults', () => {
        const cli   = new ResultCliModel();
        const model = new ResultModel(cli);
        assert.equal(model.hasError, false);
        assert.equal(model.hasWarning, false);
        assert.equal(model.files.length, 0);
        assert.equal(model.message, 'Find missing translation keys in project');
    });

    it('printResult() should do nothing when files is empty', () => {
        const model = new ResultModel(new ResultCliModel());
        model.printResult();
        assert.isFalse(errorStub.called);
    });

    it('printResult() should print header and error messages when files exist', () => {
        const error = makeError(ErrorTypes.error);
        const file  = new ResultFileModel('view.html', [error], ErrorTypes.error);
        const cli   = new ResultCliModel([error]);
        const model = new ResultModel(cli, [file], true);

        model.printResult();

        assert.isTrue(errorStub.called);
    });

    it('printResult() should print warning-type file entries', () => {
        const error = makeError(ErrorTypes.warning);
        const file  = new ResultFileModel('view.html', [error], ErrorTypes.warning);
        const cli   = new ResultCliModel([error], 100);
        const model = new ResultModel(cli, [file], false, true);

        model.printResult();

        assert.isTrue(logStub.called);
    });

    it('printResult() should handle errors whose message() returns an array', () => {
        const misprintError = new ResultErrorModel('BUTTON.SAV', ErrorFlow.misprintKeys, ErrorTypes.warning, 'file.html', ['BUTTON.SAVE']);
        const file  = new ResultFileModel('view.html', [misprintError], ErrorTypes.warning);
        const cli   = new ResultCliModel([misprintError], 100);
        const model = new ResultModel(cli, [file], false, true);

        model.printResult();
        assert.isTrue(logStub.called || errorStub.called);
    });

    it('printResult() should handle files without a value (null path)', () => {
        const error = makeError(ErrorTypes.error);
        const file  = new ResultFileModel(undefined, [error], ErrorTypes.error);
        const cli   = new ResultCliModel([error]);
        const model = new ResultModel(cli, [file], true);

        model.printResult();
        assert.isTrue(errorStub.called);
    });

    describe('printSummery()', () => {
        it('should do nothing when no warnings or errors', () => {
            const model = new ResultModel(new ResultCliModel());
            model.printSummery();
            assert.isFalse(errorStub.called);
            assert.isFalse(logStub.called);
        });

        it('should print summary when there are errors', () => {
            const err = makeError(ErrorTypes.error);
            const cli = new ResultCliModel([err]);
            const model = new ResultModel(cli, [], true);

            model.printSummery();
            assert.isTrue(errorStub.called);
        });

        it('should print empty key counts when emptyKeys present', () => {
            const err = makeError(ErrorTypes.warning, ErrorFlow.emptyKeys);
            const cli = new ResultCliModel([err], 100);
            const model = new ResultModel(cli, [], false, true);

            model.printSummery();
            assert.isTrue(logStub.called || errorStub.called);
        });

        it('should print zombie key counts', () => {
            const err = makeError(ErrorTypes.warning, ErrorFlow.zombieKeys);
            const cli = new ResultCliModel([err], 100);
            const model = new ResultModel(cli, [], false, true);

            model.printSummery();
            assert.isTrue(logStub.called || errorStub.called);
        });

        it('should print misprint key counts', () => {
            const err = makeError(ErrorTypes.warning, ErrorFlow.misprintKeys);
            const cli = new ResultCliModel([err], 100);
            const model = new ResultModel(cli, [], false, true);

            model.printSummery();
            assert.isTrue(logStub.called || errorStub.called);
        });

        it('should print keysOnViews key counts', () => {
            const err = makeError(ErrorTypes.warning, ErrorFlow.keysOnViews);
            const cli = new ResultCliModel([err], 100);
            const model = new ResultModel(cli, [], false, true);

            model.printSummery();
            assert.isTrue(logStub.called || errorStub.called);
        });

        it('should treat everything as error when isFullOfWarning', () => {
            const warns = [
                makeError(ErrorTypes.warning, ErrorFlow.emptyKeys),
                makeError(ErrorTypes.warning, ErrorFlow.zombieKeys),
                makeError(ErrorTypes.warning, ErrorFlow.misprintKeys),
                makeError(ErrorTypes.warning, ErrorFlow.keysOnViews),
            ];
            const cli   = new ResultCliModel(warns, 1);
            const model = new ResultModel(cli, [], false, true);

            model.printSummery();
            assert.isTrue(errorStub.called);
        });
    });

    describe('StylishLogger.printMessage()', () => {
        it('printMessage with error type should call console.error', () => {
            const cli   = new ResultCliModel([makeError(ErrorTypes.error)]);
            const model = new ResultModel(cli, [], true);

            model.printSummery();
            assert.isTrue(errorStub.called);
        });

        it('printMessage with warning type should call console.log', () => {
            const cli   = new ResultCliModel([makeError(ErrorTypes.warning)], 100);
            const model = new ResultModel(cli, [], false, true);

            model.printSummery();
            assert.isTrue(logStub.called);
        });
    });
});