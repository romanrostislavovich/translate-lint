import 'mocha';
import { assert } from 'chai';
import { EmptyKeysRule } from '../../src/core/rules/EmptyKeysRule';
import { ErrorTypes, ErrorFlow } from '../../src/core/enums';
import { KeyModel } from '../../src/core/models';

describe('EmptyKeysRule', () => {
    it('should report a key with empty string value', () => {
        const rule    = new EmptyKeysRule(ErrorTypes.warning);
        const langKey = new KeyModel('EMPTY.KEY', [], ['en.json'], '');

        const result = rule.check([langKey]);

        assert.equal(result.length, 1);
        assert.equal(result[0].value, 'EMPTY.KEY');
        assert.equal(result[0].errorFlow, ErrorFlow.emptyKeys);
        assert.equal(result[0].errorType, ErrorTypes.warning);
    });

    it('should not report a key with non-empty value', () => {
        const rule    = new EmptyKeysRule(ErrorTypes.warning);
        const langKey = new KeyModel('FILLED.KEY', [], ['en.json'], 'Hello');

        assert.equal(rule.check([langKey]).length, 0);
    });

    it('should report with error severity', () => {
        const rule    = new EmptyKeysRule(ErrorTypes.error);
        const langKey = new KeyModel('EMPTY.KEY', [], ['en.json'], '');

        assert.equal(rule.check([langKey])[0].errorType, ErrorTypes.error);
    });

    it('should handle multiple keys — report only empty ones', () => {
        const rule = new EmptyKeysRule(ErrorTypes.warning);
        const keys = [
            new KeyModel('KEY.ONE',   [], ['en.json'], 'Value'),
            new KeyModel('KEY.EMPTY', [], ['en.json'], ''),
            new KeyModel('KEY.TWO',   [], ['en.json'], 'Another'),
        ];

        const result = rule.check(keys);

        assert.equal(result.length, 1);
        assert.equal(result[0].value, 'KEY.EMPTY');
    });

    it('should have correct flow identifier', () => {
        assert.equal(new EmptyKeysRule().flow, ErrorFlow.emptyKeys);
    });
});