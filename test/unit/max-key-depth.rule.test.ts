import 'mocha';
import { assert } from 'chai';
import { MaxKeyDepthRule } from '../../src/core/rules/MaxKeyDepthRule';
import { ErrorTypes, ErrorFlow } from '../../src/core/enums';
import { KeyModel } from '../../src/core/models';

describe('MaxKeyDepthRule', () => {
    it('should report key that exceeds max depth', () => {
        const rule = new MaxKeyDepthRule(ErrorTypes.error, 3);
        const key = new KeyModel('a.b.c.d', [], ['en.json']);

        const result = rule.check([], [key]);

        assert.equal(result.length, 1);
        assert.equal(result[0].value, 'a.b.c.d');
        assert.equal(result[0].errorFlow, ErrorFlow.maxKeyDepth);
        assert.equal(result[0].errorType, ErrorTypes.error);
        assert.equal(result[0].currentPath, 'en.json');
        assert.equal(result[0].absentedPath, '3');
    });

    it('should not report key exactly at max depth', () => {
        const rule = new MaxKeyDepthRule(ErrorTypes.error, 3);
        const key = new KeyModel('a.b.c', [], ['en.json']);

        assert.equal(rule.check([], [key]).length, 0);
    });

    it('should not report key below max depth', () => {
        const rule = new MaxKeyDepthRule(ErrorTypes.error, 3);
        const key = new KeyModel('a.b', [], ['en.json']);

        assert.equal(rule.check([], [key]).length, 0);
    });

    it('should not report a flat key (depth 1)', () => {
        const rule = new MaxKeyDepthRule(ErrorTypes.error, 3);
        const key = new KeyModel('SIMPLE_KEY', [], ['en.json']);

        assert.equal(rule.check([], [key]).length, 0);
    });

    it('should report one error per language file', () => {
        const rule = new MaxKeyDepthRule(ErrorTypes.warning, 2);
        const key = new KeyModel('a.b.c', [], ['en.json', 'fr.json']);

        const result = rule.check([], [key]);

        assert.equal(result.length, 2);
        assert.equal(result[0].currentPath, 'en.json');
        assert.equal(result[1].currentPath, 'fr.json');
    });

    it('should support warning severity', () => {
        const rule = new MaxKeyDepthRule(ErrorTypes.warning, 2);
        const key = new KeyModel('a.b.c', [], ['en.json']);

        const result = rule.check([], [key]);

        assert.equal(result[0].errorType, ErrorTypes.warning);
    });

    it('should report only keys that exceed depth, skip valid ones', () => {
        const rule = new MaxKeyDepthRule(ErrorTypes.error, 3);
        const keys = [
            new KeyModel('ok.key',         [], ['en.json']),
            new KeyModel('ok.key.three',   [], ['en.json']),
            new KeyModel('too.deep.key.d', [], ['en.json']),
            new KeyModel('also.too.deep.x.y', [], ['en.json']),
        ];

        const result = rule.check([], keys);

        assert.equal(result.length, 2);
        assert.equal(result[0].value, 'too.deep.key.d');
        assert.equal(result[1].value, 'also.too.deep.x.y');
    });

    it('should store max depth in absentedPath for message formatting', () => {
        const rule = new MaxKeyDepthRule(ErrorTypes.error, 5);
        const key = new KeyModel('a.b.c.d.e.f', [], ['en.json']);

        const result = rule.check([], [key]);

        assert.equal(result[0].absentedPath, '5');
    });

    it('should produce correct message via ResultErrorModel.message()', () => {
        const rule = new MaxKeyDepthRule(ErrorTypes.error, 3);
        const key = new KeyModel('a.b.c.d', [], ['en.json']);

        const result = rule.check([], [key]);
        const msg = result[0].message() as string;

        assert.include(msg, 'a.b.c.d');
        assert.include(msg, '3');
        assert.include(msg, '4');
        assert.include(msg, 'en.json');
    });

    it('should return empty array when languagesKeys is empty', () => {
        const rule = new MaxKeyDepthRule(ErrorTypes.error, 3);

        assert.equal(rule.check([], []).length, 0);
    });

    it('should have correct flow identifier', () => {
        assert.equal(new MaxKeyDepthRule(ErrorTypes.error, 3).flow, ErrorFlow.maxKeyDepth);
    });
});