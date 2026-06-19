import 'mocha';
import { assert } from 'chai';
import { NamespaceRule } from '../../src/core/rules/NamespaceRule';
import { ErrorTypes, ErrorFlow } from '../../src/core/enums';
import { KeyModel } from '../../src/core/models';
import { INamespaceRule } from '../../src/core/interface/IAppConfig';

describe('NamespaceRule', () => {
    const baseConfig: INamespaceRule = {
        type: ErrorTypes.error,
        delimiter: '.',
        namespaces: {
            bonus: ['apps/bonus', 'apps/bonus-detail'],
            auth:  ['apps/auth'],
        },
        globalNamespaces: ['g', 'common'],
        ignoreInFolders: ['sandbox'],
    };

    it('should report error when key is used in a disallowed folder', () => {
        const rule = new NamespaceRule(baseConfig);
        const key  = new KeyModel('bonus.TITLE', ['apps/dashboard/component.html']);

        const result = rule.check([key], []);

        assert.equal(result.length, 1);
        assert.equal(result[0].value, 'bonus.TITLE');
        assert.equal(result[0].errorFlow, ErrorFlow.namespaceKeys);
        assert.equal(result[0].currentPath, 'apps/dashboard/component.html');
        assert.deepEqual(result[0].absentedPath, ['apps/bonus', 'apps/bonus-detail']);
    });

    it('should not report when key is used in an allowed folder', () => {
        const rule = new NamespaceRule(baseConfig);
        const key  = new KeyModel('bonus.TITLE', ['apps/bonus/component.html']);

        assert.equal(rule.check([key], []).length, 0);
    });

    it('should not report for second allowed folder', () => {
        const rule = new NamespaceRule(baseConfig);
        const key  = new KeyModel('bonus.TITLE', ['apps/bonus-detail/page.html']);

        assert.equal(rule.check([key], []).length, 0);
    });

    it('should not report for global namespace used anywhere', () => {
        const rule = new NamespaceRule(baseConfig);
        const key  = new KeyModel('g.CANCEL', ['apps/dashboard/component.html']);

        assert.equal(rule.check([key], []).length, 0);
    });

    it('should skip key with unknown namespace', () => {
        const rule = new NamespaceRule(baseConfig);
        const key  = new KeyModel('unknown.KEY', ['apps/dashboard/component.html']);

        assert.equal(rule.check([key], []).length, 0);
    });

    it('should skip key without delimiter', () => {
        const rule = new NamespaceRule(baseConfig);
        const key  = new KeyModel('SIMPLE_KEY', ['apps/dashboard/component.html']);

        assert.equal(rule.check([key], []).length, 0);
    });

    it('should skip files inside ignoreInFolders', () => {
        const rule = new NamespaceRule(baseConfig);
        const key  = new KeyModel('bonus.TITLE', ['apps/sandbox/component.html']);

        assert.equal(rule.check([key], []).length, 0);
    });

    it('should produce warning severity when type is warning', () => {
        const rule = new NamespaceRule({ ...baseConfig, type: ErrorTypes.warning });
        const key  = new KeyModel('bonus.TITLE', ['apps/dashboard/component.html']);

        const result = rule.check([key], []);

        assert.equal(result[0].errorType, ErrorTypes.warning);
    });

    it('should support colon delimiter (react-i18next style)', () => {
        const rule = new NamespaceRule({ ...baseConfig, delimiter: ':' });
        const key  = new KeyModel('bonus:TITLE', ['apps/dashboard/component.html']);

        const result = rule.check([key], []);

        assert.equal(result.length, 1);
        assert.equal(result[0].value, 'bonus:TITLE');
    });

    it('should report one error per violating view path', () => {
        const rule = new NamespaceRule(baseConfig);
        const key  = new KeyModel('bonus.TITLE', [
            'apps/bonus/component.html',   // allowed
            'apps/dashboard/page.html',    // not allowed
            'apps/profile/page.html',      // not allowed
        ]);

        const result = rule.check([key], []);

        assert.equal(result.length, 2);
    });

    it('should have correct flow identifier', () => {
        assert.equal(new NamespaceRule(baseConfig).flow, ErrorFlow.namespaceKeys);
    });
});