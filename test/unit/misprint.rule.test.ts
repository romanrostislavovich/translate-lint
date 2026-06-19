import 'mocha';
import { assert } from 'chai';
import { MisprintRule } from '../../src/core/rules/MisprintRule';
import { ErrorTypes, ErrorFlow } from '../../src/core/enums';
import { ResultErrorModel } from '../../src/core/models/results/ResultErrorModel';
import { KeyModel } from '../../src/core/models';

describe('MisprintRule', () => {
    const langKeys = [
        new KeyModel('BUTTON.SAVE',   [], ['en.json']),
        new KeyModel('BUTTON.CANCEL', [], ['en.json']),
        new KeyModel('HEADER.TITLE',  [], ['en.json']),
    ];

    function makeError(value: string, path = 'view.html'): ResultErrorModel {
        return new ResultErrorModel(value, ErrorFlow.keysOnViews, ErrorTypes.error, path, ['en.json']);
    }

    it('should detect a likely misprint and suggest the correct key', () => {
        const rule   = new MisprintRule(ErrorTypes.warning, 0.9);
        const errors = [makeError('BUTTON.SAV')]; // typo: missing E

        const result = rule.check(errors, langKeys);

        assert.equal(result.length, 1);
        assert.equal(result[0].value, 'BUTTON.SAV');
        assert.include(result[0].suggestions, 'BUTTON.SAVE');
        assert.equal(result[0].errorFlow, ErrorFlow.misprintKeys);
    });

    it('should not flag exact-match keys as misprintKeys', () => {
        const rule   = new MisprintRule(ErrorTypes.warning, 0.9);
        const errors = [makeError('BUTTON.SAVE')];

        assert.equal(rule.check(errors, langKeys).length, 0);
    });

    it('should not flag low-similarity keys', () => {
        const rule   = new MisprintRule(ErrorTypes.warning, 0.9);
        const errors = [makeError('COMPLETELY.DIFFERENT')];

        assert.equal(rule.check(errors, langKeys).length, 0);
    });

    it('should skip keys listed in ignoredMisprintKeys', () => {
        const rule   = new MisprintRule(ErrorTypes.warning, 0.9, ['BUTTON.SAV']);
        const errors = [makeError('BUTTON.SAV')];

        assert.equal(rule.check(errors, langKeys).length, 0);
    });

    it('should produce warning severity by default', () => {
        const rule   = new MisprintRule(ErrorTypes.warning, 0.9);
        const errors = [makeError('BUTTON.SAV')];
        const result = rule.check(errors, langKeys);

        assert.equal(result[0]?.errorType, ErrorTypes.warning);
    });

    it('should have correct flow identifier', () => {
        assert.equal(new MisprintRule().flow, ErrorFlow.misprintKeys);
    });
});