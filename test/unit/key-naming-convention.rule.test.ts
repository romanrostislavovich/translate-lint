import 'mocha';
import { assert } from 'chai';
import { KeyNamingConventionRule } from '../../src/core/rules/KeyNamingConventionRule';
import { ErrorFlow, ErrorTypes, NamingConvention } from '../../src/core/enums';
import { KeyModel } from '../../src/core/models';

describe('KeyNamingConventionRule', () => {

    // ── SCREAMING_SNAKE ──────────────────────────────────────────────────────

    describe('SCREAMING_SNAKE', () => {
        const rule = new KeyNamingConventionRule(ErrorTypes.error, NamingConvention.SCREAMING_SNAKE);

        it('should not report valid SCREAMING_SNAKE keys', () => {
            const keys = [
                new KeyModel('MY_KEY', [], ['en.json']),
                new KeyModel('BUTTON.CANCEL', [], ['en.json']),
                new KeyModel('AUTH.LOGIN_BUTTON.TEXT', [], ['en.json']),
                new KeyModel('A', [], ['en.json']),
            ];
            assert.equal(rule.check([], keys).length, 0);
        });

        it('should report a camelCase segment in a SCREAMING_SNAKE context', () => {
            const key = new KeyModel('BUTTON.cancelText', [], ['en.json']);
            const result = rule.check([], [key]);

            assert.equal(result.length, 1);
            assert.equal(result[0].value, 'BUTTON.cancelText');
            assert.include(result[0].absentedPath as string, 'cancelText');
        });

        it('should report a lowercase segment', () => {
            const key = new KeyModel('button.CANCEL', [], ['en.json']);
            const result = rule.check([], [key]);

            assert.equal(result.length, 1);
            assert.include(result[0].absentedPath as string, 'button');
        });
    });

    // ── camelCase ─────────────────────────────────────────────────────────────

    describe('camelCase', () => {
        const rule = new KeyNamingConventionRule(ErrorTypes.error, NamingConvention.camelCase);

        it('should not report valid camelCase keys', () => {
            const keys = [
                new KeyModel('button', [], ['en.json']),
                new KeyModel('auth.loginButton', [], ['en.json']),
                new KeyModel('myApp.settings.darkMode', [], ['en.json']),
            ];
            assert.equal(rule.check([], keys).length, 0);
        });

        it('should report a SCREAMING_SNAKE segment in a camelCase context', () => {
            const key = new KeyModel('auth.LOGIN_BUTTON', [], ['en.json']);
            const result = rule.check([], [key]);

            assert.equal(result.length, 1);
            assert.include(result[0].absentedPath as string, 'LOGIN_BUTTON');
        });

        it('should report a PascalCase segment', () => {
            const key = new KeyModel('auth.LoginButton', [], ['en.json']);
            const result = rule.check([], [key]);

            assert.equal(result.length, 1);
            assert.include(result[0].absentedPath as string, 'LoginButton');
        });
    });

    // ── snake_case ────────────────────────────────────────────────────────────

    describe('snake_case', () => {
        const rule = new KeyNamingConventionRule(ErrorTypes.error, NamingConvention.snake_case);

        it('should not report valid snake_case keys', () => {
            const keys = [
                new KeyModel('button', [], ['en.json']),
                new KeyModel('auth.login_button', [], ['en.json']),
                new KeyModel('my_app.user_settings', [], ['en.json']),
            ];
            assert.equal(rule.check([], keys).length, 0);
        });

        it('should report a camelCase segment in a snake_case context', () => {
            const key = new KeyModel('auth.loginButton', [], ['en.json']);
            const result = rule.check([], [key]);

            assert.equal(result.length, 1);
            assert.include(result[0].absentedPath as string, 'loginButton');
        });
    });

    // ── kebab-case ────────────────────────────────────────────────────────────

    describe('kebab-case', () => {
        const rule = new KeyNamingConventionRule(ErrorTypes.error, NamingConvention.kebabCase);

        it('should not report valid kebab-case keys', () => {
            const keys = [
                new KeyModel('button', [], ['en.json']),
                new KeyModel('auth.login-button', [], ['en.json']),
                new KeyModel('my-app.user-settings', [], ['en.json']),
            ];
            assert.equal(rule.check([], keys).length, 0);
        });

        it('should report a snake_case segment in a kebab-case context', () => {
            const key = new KeyModel('auth.login_button', [], ['en.json']);
            const result = rule.check([], [key]);

            assert.equal(result.length, 1);
            assert.include(result[0].absentedPath as string, 'login_button');
        });
    });

    // ── PascalCase ────────────────────────────────────────────────────────────

    describe('PascalCase', () => {
        const rule = new KeyNamingConventionRule(ErrorTypes.error, NamingConvention.PascalCase);

        it('should not report valid PascalCase keys', () => {
            const keys = [
                new KeyModel('Button', [], ['en.json']),
                new KeyModel('Auth.LoginButton', [], ['en.json']),
                new KeyModel('MyApp.UserSettings', [], ['en.json']),
            ];
            assert.equal(rule.check([], keys).length, 0);
        });

        it('should report a camelCase segment in a PascalCase context', () => {
            const key = new KeyModel('Auth.loginButton', [], ['en.json']);
            const result = rule.check([], [key]);

            assert.equal(result.length, 1);
            assert.include(result[0].absentedPath as string, 'loginButton');
        });
    });

    // ── Common behaviour ──────────────────────────────────────────────────────

    it('should report one error per language file', () => {
        const rule = new KeyNamingConventionRule(ErrorTypes.error, NamingConvention.SCREAMING_SNAKE);
        const key = new KeyModel('BUTTON.invalid', [], ['en.json', 'fr.json', 'de.json']);

        const result = rule.check([], [key]);

        assert.equal(result.length, 3);
        assert.equal(result[0].currentPath, 'en.json');
        assert.equal(result[1].currentPath, 'fr.json');
        assert.equal(result[2].currentPath, 'de.json');
    });

    it('should support warning severity', () => {
        const rule = new KeyNamingConventionRule(ErrorTypes.warning, NamingConvention.SCREAMING_SNAKE);
        const key = new KeyModel('invalid.KEY', [], ['en.json']);

        const result = rule.check([], [key]);

        assert.equal(result[0].errorType, ErrorTypes.warning);
    });

    it('should skip valid keys and only report invalid ones', () => {
        const rule = new KeyNamingConventionRule(ErrorTypes.error, NamingConvention.SCREAMING_SNAKE);
        const keys = [
            new KeyModel('GOOD_KEY',       [], ['en.json']),
            new KeyModel('ALSO.GOOD',      [], ['en.json']),
            new KeyModel('bad.KEY',        [], ['en.json']),
            new KeyModel('ANOTHER.wrong',  [], ['en.json']),
        ];

        const result = rule.check([], keys);

        assert.equal(result.length, 2);
        assert.equal(result[0].value, 'bad.KEY');
        assert.equal(result[1].value, 'ANOTHER.wrong');
    });

    it('should return empty array when languagesKeys is empty', () => {
        const rule = new KeyNamingConventionRule(ErrorTypes.error, NamingConvention.SCREAMING_SNAKE);
        assert.equal(rule.check([], []).length, 0);
    });

    it('should have correct flow identifier', () => {
        const rule = new KeyNamingConventionRule(ErrorTypes.error, NamingConvention.SCREAMING_SNAKE);
        assert.equal(rule.flow, ErrorFlow.keyNamingConvention);
    });

    it('should set errorFlow on the result', () => {
        const rule = new KeyNamingConventionRule(ErrorTypes.error, NamingConvention.SCREAMING_SNAKE);
        const key = new KeyModel('invalid.KEY', [], ['en.json']);

        const result = rule.check([], [key]);

        assert.equal(result[0].errorFlow, ErrorFlow.keyNamingConvention);
    });

    it('should encode format name in absentedPath', () => {
        const rule = new KeyNamingConventionRule(ErrorTypes.error, NamingConvention.camelCase);
        const key = new KeyModel('auth.LOGIN_BUTTON', [], ['en.json']);

        const result = rule.check([], [key]);

        assert.include(result[0].absentedPath as string, 'camelCase');
    });

    it('should produce correct message via ResultErrorModel.message()', () => {
        const rule = new KeyNamingConventionRule(ErrorTypes.error, NamingConvention.SCREAMING_SNAKE);
        const key = new KeyModel('BUTTON.cancelText', [], ['en.json']);

        const result = rule.check([], [key]);
        const msg = result[0].message() as string;

        assert.include(msg, 'BUTTON.cancelText');
        assert.include(msg, 'cancelText');
        assert.include(msg, 'SCREAMING_SNAKE');
        assert.include(msg, 'en.json');
    });
});