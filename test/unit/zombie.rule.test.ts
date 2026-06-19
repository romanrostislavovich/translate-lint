import 'mocha';
import { assert } from 'chai';
import { ZombieRule } from '../../src/core/rules/ZombiesRule';
import { ErrorTypes, ErrorFlow } from '../../src/core/enums';
import { KeyModel } from '../../src/core/models';

describe('ZombieRule', () => {
    it('should report a key that exists in languages but not in views', () => {
        const rule      = new ZombieRule(ErrorTypes.warning);
        const viewKeys  = [new KeyModel('USED.KEY', ['view.html'])];
        const langKeys  = [
            new KeyModel('USED.KEY',   [], ['en.json']),
            new KeyModel('ZOMBIE.KEY', [], ['en.json']),
        ];

        const result = rule.check(viewKeys, langKeys);

        assert.equal(result.length, 1);
        assert.equal(result[0].value, 'ZOMBIE.KEY');
        assert.equal(result[0].errorFlow, ErrorFlow.zombieKeys);
        assert.equal(result[0].errorType, ErrorTypes.warning);
    });

    it('should not report a key that is used in views', () => {
        const rule     = new ZombieRule(ErrorTypes.warning);
        const viewKeys = [new KeyModel('USED.KEY', ['view.html'])];
        const langKeys = [new KeyModel('USED.KEY', [], ['en.json'])];

        assert.equal(rule.check(viewKeys, langKeys).length, 0);
    });

    it('should report one error per language file the zombie key appears in', () => {
        const rule     = new ZombieRule(ErrorTypes.error);
        const viewKeys = [] as KeyModel[];
        const langKeys = [
            new KeyModel('ZOMBIE.KEY', [], ['en.json', 'fr.json']),
        ];

        const result = rule.check(viewKeys, langKeys);

        assert.equal(result.length, 2);
        assert.equal(result[0].errorType, ErrorTypes.error);
    });

    it('should return empty array when all language keys are used', () => {
        const rule     = new ZombieRule(ErrorTypes.error);
        const viewKeys = [
            new KeyModel('KEY.ONE', ['view.html']),
            new KeyModel('KEY.TWO', ['view.html']),
        ];
        const langKeys = [
            new KeyModel('KEY.ONE', [], ['en.json']),
            new KeyModel('KEY.TWO', [], ['en.json']),
        ];

        assert.equal(rule.check(viewKeys, langKeys).length, 0);
    });

    it('should have correct flow identifier', () => {
        assert.equal(new ZombieRule().flow, ErrorFlow.zombieKeys);
    });
});