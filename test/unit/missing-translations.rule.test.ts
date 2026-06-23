import 'mocha';
import { assert } from 'chai';
import { MissingTranslationsRule } from '../../src/core/rules/MissingTranslationsRule';
import { ErrorTypes, ErrorFlow } from '../../src/core/enums';
import { KeyModel } from '../../src/core/models';

const files = ['locales/en.json', 'locales/ru.json', 'locales/fr.json'];

describe('MissingTranslationsRule', () => {
    it('should report missing key for each file it is absent from', () => {
        const key = new KeyModel('AUTH.TITLE', [], ['locales/en.json']); // missing in ru + fr
        const rule = new MissingTranslationsRule(ErrorTypes.warning, files);

        const result = rule.check([], [key]);

        assert.equal(result.length, 2);
        assert.isTrue(result.every(r => r.value === 'AUTH.TITLE'));
        assert.isTrue(result.every(r => r.errorFlow === ErrorFlow.missingTranslations));
    });

    it('should report correct missing file paths', () => {
        const key = new KeyModel('BTN.SAVE', [], ['locales/en.json']);
        const rule = new MissingTranslationsRule(ErrorTypes.warning, files);

        const result = rule.check([], [key]);
        const missingPaths = result.map(r => r.currentPath);

        assert.include(missingPaths, 'locales/ru.json');
        assert.include(missingPaths, 'locales/fr.json');
        assert.notInclude(missingPaths, 'locales/en.json');
    });

    it('should store present file basenames in absentedPath', () => {
        const key = new KeyModel('BTN.SAVE', [], ['locales/en.json']);
        const rule = new MissingTranslationsRule(ErrorTypes.warning, files);

        const result = rule.check([], [key]);

        assert.isArray(result[0].absentedPath);
        assert.include(result[0].absentedPath as string[], 'en.json');
    });

    it('should not report a key that exists in all files', () => {
        const key = new KeyModel('AUTH.TITLE', [], [...files]);
        const rule = new MissingTranslationsRule(ErrorTypes.warning, files);

        assert.equal(rule.check([], [key]).length, 0);
    });

    it('should use the configured error type', () => {
        const key = new KeyModel('AUTH.TITLE', [], ['locales/en.json']);
        const rule = new MissingTranslationsRule(ErrorTypes.error, files);

        const result = rule.check([], [key]);

        assert.isTrue(result.every(r => r.errorType === ErrorTypes.error));
    });

    it('should return empty array when fewer than 2 files are configured', () => {
        const key = new KeyModel('AUTH.TITLE', [], ['locales/en.json']);
        const rule = new MissingTranslationsRule(ErrorTypes.warning, ['locales/en.json']);

        assert.equal(rule.check([], [key]).length, 0);
    });

    it('should return empty array when no files are configured', () => {
        const key = new KeyModel('AUTH.TITLE', [], ['locales/en.json']);
        const rule = new MissingTranslationsRule(ErrorTypes.warning, []);

        assert.equal(rule.check([], [key]).length, 0);
    });

    it('should handle multiple keys with different coverage', () => {
        const keys = [
            new KeyModel('KEY.ONE', [], ['locales/en.json', 'locales/ru.json', 'locales/fr.json']),
            new KeyModel('KEY.TWO', [], ['locales/en.json']),
            new KeyModel('KEY.THREE', [], ['locales/en.json', 'locales/ru.json']),
        ];
        const rule = new MissingTranslationsRule(ErrorTypes.warning, files);

        const result = rule.check([], keys);

        assert.equal(result.filter(r => r.value === 'KEY.ONE').length, 0);
        assert.equal(result.filter(r => r.value === 'KEY.TWO').length, 2);
        assert.equal(result.filter(r => r.value === 'KEY.THREE').length, 1);
    });

    it('should produce correct message via ResultErrorModel.message()', () => {
        const key = new KeyModel('AUTH.TITLE', [], ['locales/en.json']);
        const rule = new MissingTranslationsRule(ErrorTypes.warning, files);

        const result = rule.check([], [key]);
        const msg = result[0].message() as string;

        assert.include(msg, 'AUTH.TITLE');
        assert.include(msg, 'missing');
        assert.include(msg, 'en.json');
    });

    it('should have correct flow identifier', () => {
        assert.equal(new MissingTranslationsRule().flow, ErrorFlow.missingTranslations);
    });

    it('should return empty array when languagesKeys is empty', () => {
        const rule = new MissingTranslationsRule(ErrorTypes.warning, files);
        assert.equal(rule.check([], []).length, 0);
    });
});