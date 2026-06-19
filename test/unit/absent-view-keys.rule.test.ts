import 'mocha';
import { assert } from 'chai';
import { AbsentViewKeysRule } from '../../src/core/rules/AbsentViewKeysRule';
import { ErrorTypes, ErrorFlow } from '../../src/core/enums';
import { KeyModel } from '../../src/core/models';

describe('AbsentViewKeysRule', () => {
    const langPaths = ['en.json', 'fr.json'];

    it('should report key used in view but absent from all language files', () => {
        const rule     = new AbsentViewKeysRule(ErrorTypes.error, langPaths);
        const viewKey  = new KeyModel('MISSING.KEY', ['view.html'], []);
        const langKeys = [] as KeyModel[];

        const result = rule.check([viewKey], langKeys);

        assert.equal(result.length, 1);
        assert.equal(result[0].value, 'MISSING.KEY');
        assert.equal(result[0].errorFlow, ErrorFlow.keysOnViews);
        assert.equal(result[0].errorType, ErrorTypes.error);
    });

    it('should report key present in only one of two language files', () => {
        const rule     = new AbsentViewKeysRule(ErrorTypes.error, langPaths);
        const viewKey  = new KeyModel('PARTIAL.KEY', ['view.html'], []);
        const langKey  = new KeyModel('PARTIAL.KEY', [],            ['en.json']);

        const result = rule.check([viewKey], [langKey]);

        assert.equal(result.length, 1);
        assert.deepEqual(result[0].absentedPath, ['fr.json']);
    });

    it('should not report key that exists in all language files', () => {
        const rule     = new AbsentViewKeysRule(ErrorTypes.error, langPaths);
        const viewKey  = new KeyModel('FULL.KEY', ['view.html'], []);
        const langKeys = [
            new KeyModel('FULL.KEY', [], ['en.json']),
            new KeyModel('FULL.KEY', [], ['fr.json']),
        ];

        assert.equal(rule.check([viewKey], langKeys).length, 0);
    });

    it('should report one error per view file using the absent key', () => {
        const rule    = new AbsentViewKeysRule(ErrorTypes.error, langPaths);
        const viewKey = new KeyModel('MISSING.KEY', ['page1.html', 'page2.html'], []);

        const result = rule.check([viewKey], []);

        assert.equal(result.length, 2);
        assert.equal(result[0].currentPath, 'page1.html');
        assert.equal(result[1].currentPath, 'page2.html');
    });

    it('should support warning severity', () => {
        const rule    = new AbsentViewKeysRule(ErrorTypes.warning, langPaths);
        const viewKey = new KeyModel('MISSING.KEY', ['view.html'], []);

        const result = rule.check([viewKey], []);

        assert.equal(result[0].errorType, ErrorTypes.warning);
    });

    it('should return languagesCount equal to path list length', () => {
        const rule = new AbsentViewKeysRule(ErrorTypes.error, langPaths);
        assert.equal(rule.languagesCount(), 2);
    });

    it('should have correct flow identifier', () => {
        assert.equal(new AbsentViewKeysRule(ErrorTypes.error, []).flow, ErrorFlow.keysOnViews);
    });
});