import * as exports from './index';

it('should export the correct API', () => {
    expect(exports).toEqual({
        LayoutManager: expect.any(Function),
        withLayout: expect.any(Function),
    });
});
