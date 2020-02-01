import React from 'react';
import withLayout, { getLayoutFromPage, shouldInjectSetLayoutProp } from './with-layout';

const PrimaryLayout = ({ children }) => <div>{ children }</div>;

const createPage = (pageName) => () => <div>{ pageName }</div>;

describe('getLayoutFromPage', () => {
    it('should return the correct layout if wrapped normally', () => {
        const Home = withLayout(<PrimaryLayout />)(createPage('home'));

        const ret = getLayoutFromPage(Home, {});

        expect(ret).toEqual({
            Layout: PrimaryLayout,
            layoutProps: {},
        });
    });

    it('should return the correct layout if wrapped with props', () => {
        const Home = withLayout(<PrimaryLayout variant="light" />)(createPage('home'));

        const ret = getLayoutFromPage(Home, {});

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

    it('should return the default layout if wrapped with nothing', () => {
        const Home = withLayout()(createPage('home'));

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
