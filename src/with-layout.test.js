import React from 'react';
import withLayout, { getLayoutFromPage, shouldInjectSetLayoutProp } from './with-layout';

const PrimaryLayout = ({ children }) => <div>{ children }</div>;

const createPage = (pageName) => () => <div>{ pageName }</div>;

describe('withLayout', () => {
    it('should store the layout mapper into a symbol (empty)', () => {
        const Home = withLayout()(createPage('home'));

        const symbols = Object.getOwnPropertySymbols(Home);

        expect(symbols).toHaveLength(1);
        expect(Home[symbols[0]]).toEqual(expect.any(Function));
        expect(Home[symbols[0]]()).toBe(undefined);
    });

    it('should store the layout mapper into a symbol (react element)', () => {
        const layout = <PrimaryLayout />;
        const Home = withLayout(layout)(createPage('home'));

        const symbols = Object.getOwnPropertySymbols(Home);

        expect(symbols).toHaveLength(1);
        expect(Home[symbols[0]]).toEqual(expect.any(Function));
        expect(Home[symbols[0]]()).toBe(layout);
    });

    it('should store the layout mapper into a symbol (function)', () => {
        const layout = <PrimaryLayout />;
        const Home = withLayout(() => layout)(createPage('home'));

        const symbols = Object.getOwnPropertySymbols(Home);

        expect(symbols).toHaveLength(1);
        expect(Home[symbols[0]]).toEqual(expect.any(Function));
        expect(Home[symbols[0]]()).toBe(layout);
    });
});

describe('getLayoutFromPage', () => {
    it('should return the correct layout when wrapped with a react element', () => {
        const Home = withLayout(<PrimaryLayout />)(createPage('home'));

        const ret = getLayoutFromPage(Home, {});

        expect(ret).toEqual({
            Layout: PrimaryLayout,
            layoutProps: {},
        });
    });

    it('should return the correct layout when wrapped with a react element + props', () => {
        const Home = withLayout(<PrimaryLayout variant="light" />)(createPage('home'));

        const ret = getLayoutFromPage(Home, {});

        expect(ret).toEqual({
            Layout: PrimaryLayout,
            layoutProps: { variant: 'light' },
        });
    });

    it('should return the correct layout when wrapped with a function', () => {
        const layoutFn = jest.fn(({ variant }) => <PrimaryLayout variant={ variant } />);
        const Home = withLayout(layoutFn)(createPage('home'));

        const ret = getLayoutFromPage(Home, { variant: 'light' });

        expect(ret).toEqual({
            Layout: PrimaryLayout,
            layoutProps: { variant: 'light' },
        });

        expect(layoutFn).toHaveBeenCalledTimes(1);
        expect(layoutFn).toHaveBeenCalledWith({ variant: 'light' });
    });

    it('should return no layout when wrapped with nothing', () => {
        const Home = withLayout()(createPage('home'));

        const ret = getLayoutFromPage(Home, {});

        expect(ret).toEqual({
            Layout: undefined,
            layoutProps: undefined,
        });
    });

    it('should return the default layout when wrapped with nothing', () => {
        const Home = withLayout()(createPage('home'));

        const ret = getLayoutFromPage(Home, {}, <PrimaryLayout variant="light" />);

        expect(ret).toEqual({
            Layout: PrimaryLayout,
            layoutProps: { variant: 'light' },
        });
    });

    it('should return the default layout if it wasn\'t wrapped', () => {
        const Home = createPage('home');

        const ret = getLayoutFromPage(Home, {}, <PrimaryLayout variant="light" />);

        expect(ret).toEqual({
            Layout: PrimaryLayout,
            layoutProps: { variant: 'light' },
        });
    });
});

describe('shouldInjectSetLayoutProp', () => {
    it('should return true if it was wrapped, false otherwise', () => {
        const Home = createPage('home');
        const HomeWrapped = withLayout()(createPage('home'));

        expect(shouldInjectSetLayoutProp(Home)).toBe(false);
        expect(shouldInjectSetLayoutProp(HomeWrapped)).toBe(true);
    });
});
