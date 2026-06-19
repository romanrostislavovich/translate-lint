import 'mocha';
import { assert } from 'chai';
import { ResultErrorModel } from '../../src/core/models/results/ResultErrorModel';
import { ErrorFlow, ErrorTypes } from '../../src/core/enums';

describe('ResultErrorModel.message()', () => {
    it('keysOnViews — single absent path', () => {
        const model = new ResultErrorModel('MY.KEY', ErrorFlow.keysOnViews, ErrorTypes.error, 'view.html', 'en.json');
        assert.equal(model.message(), `Key: 'MY.KEY' doesn't exist in 'en.json'`);
    });

    it('keysOnViews — multiple absent paths as array', () => {
        const model  = new ResultErrorModel('MY.KEY', ErrorFlow.keysOnViews, ErrorTypes.error, 'view.html', ['en.json', 'fr.json']);
        const result = model.message() as string[];
        assert.isArray(result);
        assert.equal(result.length, 2);
        assert.include(result[0], 'en.json');
        assert.include(result[1], 'fr.json');
    });

    it('zombieKeys', () => {
        const model = new ResultErrorModel('ZOMBIE.KEY', ErrorFlow.zombieKeys, ErrorTypes.warning, 'en.json');
        assert.include(model.message() as string, 'ZOMBIE.KEY');
    });

    it('misprintKeys', () => {
        const model = new ResultErrorModel('MY.TITL', ErrorFlow.misprintKeys, ErrorTypes.warning, 'view.html', undefined, ['MY.TITLE']);
        const result = model.message() as string[];
        assert.isArray(result);
        assert.include(result[0], 'MY.TITLE');
        assert.include(result[0], 'MY.TITL');
    });

    it('emptyKeys', () => {
        const model = new ResultErrorModel('EMPTY.KEY', ErrorFlow.emptyKeys, ErrorTypes.warning, 'en.json');
        assert.include(model.message() as string, 'EMPTY.KEY');
        assert.include(model.message() as string, 'en.json');
    });

    it('namespaceKeys — with allowed folders list', () => {
        const model  = new ResultErrorModel('bonus.TITLE', ErrorFlow.namespaceKeys, ErrorTypes.error, 'apps/dashboard/component.html', ['apps/bonus', 'apps/bonus-detail']);
        const result = model.message() as string;
        assert.include(result, 'bonus.TITLE');
        assert.include(result, 'apps/dashboard/component.html');
        assert.include(result, 'apps/bonus');
    });

    it('namespaceKeys — without allowed folders', () => {
        const model  = new ResultErrorModel('bonus.TITLE', ErrorFlow.namespaceKeys, ErrorTypes.error, 'apps/dashboard/component.html');
        const result = model.message() as string;
        assert.include(result, 'bonus.TITLE');
    });

    it('unknown flow returns fallback message', () => {
        const model = new ResultErrorModel('KEY', 'unknownFlow' as ErrorFlow, ErrorTypes.error, 'file.html');
        assert.equal(model.message(), 'Unknown error please write to the author');
    });
});