import 'mocha';
import { assert } from 'chai';
import { detectJsonFormat, setMissingKey } from '../../src/core/utils/missingKeysFixUtils';

describe('detectJsonFormat()', () => {
    it('should return flat for an empty object', () => {
        assert.equal(detectJsonFormat({}), 'flat');
    });

    it('should return flat when a top-level key contains a dot', () => {
        assert.equal(detectJsonFormat({ 'AUTH.TITLE': 'Login' }), 'flat');
    });

    it('should return flat when all top-level values are primitives and keys have no dots', () => {
        assert.equal(detectJsonFormat({ TITLE: 'Login', SAVE: 'Save' }), 'flat');
    });

    it('should return nested when a top-level value is an object', () => {
        assert.equal(detectJsonFormat({ AUTH: { TITLE: 'Login' } }), 'nested');
    });

    it('should prefer flat when any key has a dot even if other values are objects', () => {
        assert.equal(detectJsonFormat({ 'AUTH.TITLE': 'Login', MENU: { HOME: 'Home' } }), 'flat');
    });
});

describe('setMissingKey()', () => {
    describe('flat format', () => {
        it('should add a dotted key at the top level', () => {
            const obj: any = { 'AUTH.TITLE': 'Login' };
            setMissingKey(obj, 'BTN.SAVE');
            assert.equal(obj['BTN.SAVE'], '');
        });

        it('should add a simple key at the top level', () => {
            const obj: any = {};
            setMissingKey(obj, 'TITLE');
            assert.equal(obj['TITLE'], '');
        });

        it('should not overwrite an existing flat key', () => {
            const obj: any = { 'AUTH.TITLE': 'Login' };
            setMissingKey(obj, 'AUTH.TITLE');
            assert.equal(obj['AUTH.TITLE'], 'Login');
        });
    });

    describe('nested format', () => {
        it('should create nested structure for a dotted key', () => {
            const obj: any = { AUTH: { TITLE: 'Login' } };
            setMissingKey(obj, 'BTN.SAVE');
            assert.equal(obj.BTN?.SAVE, '');
        });

        it('should add to an existing nested object', () => {
            const obj: any = { BTN: { SAVE: 'Save' } };
            setMissingKey(obj, 'BTN.CANCEL');
            assert.equal(obj.BTN.CANCEL, '');
            assert.equal(obj.BTN.SAVE, 'Save');
        });

        it('should handle three-level deep keys', () => {
            const obj: any = { UI: { FORM: { LABEL: 'Name' } } };
            setMissingKey(obj, 'UI.FORM.PLACEHOLDER');
            assert.equal(obj.UI.FORM.PLACEHOLDER, '');
            assert.equal(obj.UI.FORM.LABEL, 'Name');
        });

        it('should create intermediate objects if missing', () => {
            const obj: any = { OTHER: { KEY: 'val' } };
            setMissingKey(obj, 'AUTH.TITLE');
            assert.deepEqual(obj.AUTH, { TITLE: '' });
        });

        it('should not overwrite an existing nested value', () => {
            const obj: any = { AUTH: { TITLE: 'Login' } };
            setMissingKey(obj, 'AUTH.TITLE');
            assert.equal(obj.AUTH.TITLE, 'Login');
        });
    });

    describe('empty file', () => {
        it('should add as flat key when file is empty (default)', () => {
            const obj: any = {};
            setMissingKey(obj, 'AUTH.TITLE');
            assert.equal(obj['AUTH.TITLE'], '');
        });
    });
});