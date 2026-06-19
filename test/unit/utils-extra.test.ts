import 'mocha';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { assert } from 'chai';
import { FatalErrorModel } from '../../src/core/models/error/FatalErrorModel';
import { MisprintModel } from '../../src/core/models/MisprintModel';
import { parseJsonFile, saveJsonFile } from '../../src/core/utils/file';
import { KeysUtils } from '../../src/core/utils/keys';
import { ToggleRule, ErrorTypes } from '../../src/core/enums';

// ─── FatalErrorModel ────────────────────────────────────────────────────────

describe('FatalErrorModel', () => {
    it('should be an instance of Error', () => {
        const err = new FatalErrorModel('test error');
        assert.instanceOf(err, Error);
    });

    it('should have name "FatalError"', () => {
        const err = new FatalErrorModel('test');
        assert.equal(err.name, FatalErrorModel.NAME);
    });

    it('should carry the message', () => {
        const err = new FatalErrorModel('something broke');
        assert.equal(err.message, 'something broke');
    });

    it('should store optional innerError', () => {
        const inner = new Error('inner');
        const err   = new FatalErrorModel('outer', inner);
        assert.equal(err.innerError, inner);
    });

    it('instanceof check should work after setPrototypeOf', () => {
        const err = new FatalErrorModel('check');
        assert.isTrue(err instanceof FatalErrorModel);
    });
});

// ─── MisprintModel ──────────────────────────────────────────────────────────

describe('MisprintModel', () => {
    it('should use default type=warning and coefficient=0.9', () => {
        const m = new MisprintModel();
        assert.equal(m.type, ErrorTypes.warning);
        assert.equal(m.coefficient, 0.9);
    });

    it('should accept custom type and coefficient', () => {
        const m = new MisprintModel(ErrorTypes.error, 0.75);
        assert.equal(m.type, ErrorTypes.error);
        assert.equal(m.coefficient, 0.75);
    });
});

// ─── file utils ─────────────────────────────────────────────────────────────

describe('file utils', () => {
    describe('parseJsonFile', () => {
        it('should parse a valid JSON file', () => {
            const result = parseJsonFile('./test/integration/angular-ngx-translate/inputs/locales/EN-us.json');
            assert.isObject(result);
        });

        it('should throw FatalErrorModel when file does not exist', () => {
            assert.throws(
                () => parseJsonFile('./non-existent-path/file.json'),
                /File doesn't exists/
            );
        });
    });

    describe('saveJsonFile', () => {
        it('should write and read back JSON data', () => {
            const tmp  = path.join(os.tmpdir(), `translate-lint-test-${Date.now()}.json`);
            const data = { key: 'value', nested: { a: 1 } };
            saveJsonFile(data, tmp);
            const raw    = fs.readFileSync(tmp, 'utf-8');
            const parsed = JSON.parse(raw);
            assert.deepEqual(parsed, data);
            fs.unlinkSync(tmp);
        });
    });
});

// ─── KeysUtils — missing branches ───────────────────────────────────────────

describe('KeysUtils — additional branch coverage', () => {
    it('deepSearch=enable with empty keys should produce no key-specific patterns', () => {
        const regexp = KeysUtils.findKeysList([], [], ToggleRule.enable, []);
        assert.equal(regexp.source, '(?:)');
    });

    it('customRegExp accepts a RegExp instance and uses its source', () => {
        const pattern = /MY_PATTERN/;
        const regexp  = KeysUtils.findKeysList([], [pattern], ToggleRule.disable, []);
        assert.include(regexp.source, 'MY_PATTERN');
    });
});