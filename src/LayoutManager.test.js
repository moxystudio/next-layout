import React, { useEffect } from 'react';
import classNames from 'classnames';
import { render } from '@testing-library/react';
import LayoutManager from './LayoutManager';
import withLayout from './with-layout';

const PrimaryLayout = jest.fn(({ variant, children, className }) => (
    <div data-testid="layout" className={ classNames('primary-layout', variant, className) }>{ children }</div>
));

const SecondaryLayout = jest.fn(({ variant, children, className }) => (
    <div data-testid="layout" className={ classNames('secondary-layout', variant, className) }>{ children }</div>
));

const createPage = (pageName) => jest.fn(({ className }) => (
    <div data-testid="page" className={ classNames(pageName, className) }>{ pageName }</div>
));

const createPageWithLayoutProps = (pageName, layoutProps) => jest.fn(({ setLayoutProps, className }) => {
    useEffect(() => setLayoutProps(layoutProps), [setLayoutProps]);

    return (
        <div data-testid="page" className={ classNames(pageName, className) }>{ pageName }</div>
    );
});

beforeEach(() => {
    jest.clearAllMocks();
});

it('should render correctly without any layout', () => {
    const Home = createPage('home');

    const { container } = render(<LayoutManager Component={ Home } />);

    expect(container.childNodes[0]).toHaveClass('home');
});

it('should render layout specified by page', () => {
    const Home = withLayout(<PrimaryLayout />)(createPage('home'));

    const { getByTestId } = render(<LayoutManager Component={ Home } />);

    expect(getByTestId('layout')).toHaveClass('primary-layout');
    expect(getByTestId('page')).toHaveClass('home');
});

it('should render layout specified by page, with initial props', () => {
    const Home = withLayout(<PrimaryLayout variant="light" />)(createPage('home'));

    const { getByTestId } = render(<LayoutManager Component={ Home } />);

    expect(getByTestId('layout')).toHaveClass('primary-layout light');
    expect(getByTestId('page')).toHaveClass('home');
});

it('should render layout and page just once', () => {
    const Home = withLayout(<PrimaryLayout />)(createPage('home'));

    render(<LayoutManager Component={ Home } />);

    expect(PrimaryLayout).toHaveBeenCalledTimes(1);
    expect(Home).toHaveBeenCalledTimes(1);
});

it('should pass pageProps correctly', () => {
    const Home = withLayout(<PrimaryLayout variant="light" />)(createPage('home'));

    const { getByTestId } = render(
        <LayoutManager
            Component={ Home }
            pageProps={ { className: 'foo' } } />,
    );

    expect(getByTestId('layout')).toHaveClass('primary-layout');
    expect(getByTestId('page')).toHaveClass('home foo');
});

describe('defaultLayout prop', () => {
    it('should use defaultLayout if page did not specify a layout', () => {
        const Home = createPage('home');

        const { getByTestId } = render(
            <LayoutManager
                Component={ Home }
                defaultLayout={ <PrimaryLayout /> } />,
        );

        expect(getByTestId('layout')).toHaveClass('primary-layout');
        expect(getByTestId('page')).toHaveClass('home');
    });

    it('should use defaultLayout if page was wrapped without a layout', () => {
        const Home = withLayout()(createPage('home'));

        const { getByTestId } = render(
            <LayoutManager
                Component={ Home }
                defaultLayout={ <PrimaryLayout /> } />,
        );

        expect(getByTestId('layout')).toHaveClass('primary-layout');
        expect(getByTestId('page')).toHaveClass('home');
    });

    it('should not use defaultLayout if page did specify a layout', () => {
        const Home = withLayout(<SecondaryLayout variant="light" />)(createPage('home'));

        const { getByTestId } = render(
            <LayoutManager
                Component={ Home }
                defaultLayout={ <PrimaryLayout /> } />,
        );

        expect(getByTestId('layout')).toHaveClass('secondary-layout');
        expect(getByTestId('page')).toHaveClass('home');
    });
});

describe('children prop', () => {
    it('should call children function with correct argument', () => {
        const Home = withLayout(<PrimaryLayout variant="light" />)(createPage('home'));
        const children = jest.fn(() => <div>foo</div>);

        const { queryByText } = render(
            <LayoutManager Component={ Home }>
                { children }
            </LayoutManager>,
        );

        expect(children).toHaveBeenCalledTimes(1);

        const argument = children.mock.calls[0][0];

        expect(argument).toHaveProperty('Layout', PrimaryLayout);
        expect(argument).toHaveProperty('layoutProps.variant', 'light');
        expect(argument).toHaveProperty('layoutKey', 'layout-1');
        expect(argument).toHaveProperty('Component', Home);
        expect(argument).toHaveProperty('pageProps.setLayoutProps', expect.any(Function));
        expect(argument).toHaveProperty('pageKey', 'page-1');

        expect(queryByText('foo')).toBeInstanceOf(HTMLDivElement);
    });
});

describe('layout & page changes', () => {
    it('should keep layout if pages have the same layout', () => {
        const Home = withLayout(<PrimaryLayout variant="light" />)(createPage('home'));
        const About = withLayout(<PrimaryLayout variant="dark" />)(createPage('about'));
        const children = jest.fn(() => <div>foo</div>);

        const { rerender } = render(
            <LayoutManager Component={ Home }>
                { children }
            </LayoutManager>,
        );

        rerender(
            <LayoutManager Component={ About }>
                { children }
            </LayoutManager>,
        );

        expect(children).toHaveBeenCalledTimes(2);

        const argument1 = children.mock.calls[0][0];
        const argument2 = children.mock.calls[1][0];

        expect(argument1).toHaveProperty('Layout', PrimaryLayout);
        expect(argument1).toHaveProperty('layoutProps.variant', 'light');
        expect(argument1).toHaveProperty('layoutKey', 'layout-1');
        expect(argument1).toHaveProperty('Component', Home);
        expect(argument1).toHaveProperty('pageKey', 'page-1');

        expect(argument2).toHaveProperty('Layout', PrimaryLayout);
        expect(argument2).toHaveProperty('layoutProps.variant', 'dark');
        expect(argument2).toHaveProperty('layoutKey', 'layout-1');
        expect(argument2).toHaveProperty('Component', About);
        expect(argument2).toHaveProperty('pageKey', 'page-2');
    });

    it('should change layout if pages have different layouts', () => {
        const Home = withLayout(<PrimaryLayout variant="light" />)(createPage('home'));
        const About = withLayout(<SecondaryLayout variant="dark" />)(createPage('about'));
        const children = jest.fn(() => <div>foo</div>);

        const { rerender } = render(
            <LayoutManager Component={ Home }>
                { children }
            </LayoutManager>,
        );

        rerender(
            <LayoutManager Component={ About }>
                { children }
            </LayoutManager>,
        );

        expect(children).toHaveBeenCalledTimes(2);

        const argument1 = children.mock.calls[0][0];
        const argument2 = children.mock.calls[1][0];

        expect(argument1).toHaveProperty('Layout', PrimaryLayout);
        expect(argument1).toHaveProperty('layoutProps.variant', 'light');
        expect(argument1).toHaveProperty('layoutKey', 'layout-1');
        expect(argument1).toHaveProperty('Component', Home);
        expect(argument1).toHaveProperty('pageKey', 'page-1');

        expect(argument2).toHaveProperty('Layout', SecondaryLayout);
        expect(argument2).toHaveProperty('layoutProps.variant', 'dark');
        expect(argument2).toHaveProperty('layoutKey', 'layout-2');
        expect(argument2).toHaveProperty('Component', About);
        expect(argument2).toHaveProperty('pageKey', 'page-2');
    });

    it('should behave well if neither layout or page changed', () => {
        const Home = withLayout(<PrimaryLayout variant="light" />)(createPage('home'));
        const children = jest.fn(() => <div>foo</div>);

        const { rerender } = render(
            <LayoutManager Component={ Home }>
                { children }
            </LayoutManager>,
        );

        rerender(
            <LayoutManager Component={ Home }>
                { children }
            </LayoutManager>,
        );

        expect(children).toHaveBeenCalledTimes(2);

        const argument1 = children.mock.calls[0][0];
        const argument2 = children.mock.calls[1][0];

        expect(argument1).toHaveProperty('Layout', PrimaryLayout);
        expect(argument1).toHaveProperty('layoutProps.variant', 'light');
        expect(argument1).toHaveProperty('layoutKey', 'layout-1');
        expect(argument1).toHaveProperty('Component', Home);
        expect(argument1).toHaveProperty('pageKey', 'page-1');

        expect(argument2).toHaveProperty('Layout', PrimaryLayout);
        expect(argument2).toHaveProperty('layoutProps.variant', 'light');
        expect(argument2).toHaveProperty('layoutKey', 'layout-1');
        expect(argument2).toHaveProperty('Component', Home);
        expect(argument2).toHaveProperty('pageKey', 'page-1');
    });
});

describe('injected setLayoutProps', () => {
    it('should allow changing layout props dynamically', async () => {
        const Home = withLayout(<PrimaryLayout />)(createPageWithLayoutProps('home', { variant: 'dark' }));

        const { getByTestId } = render(<LayoutManager Component={ Home } />);

        await new Promise((resolve) => setTimeout(resolve, 25));

        expect(getByTestId('layout')).toHaveClass('primary-layout dark');
        expect(getByTestId('page')).toHaveClass('home');
    });

    it('should support passing an updater function', async () => {
        const updater = jest.fn(() => ({ variant: 'dark', className: 'foo' }));
        const Home = withLayout(<PrimaryLayout variant="light" />)(createPageWithLayoutProps('home', updater));

        const { getByTestId } = render(<LayoutManager Component={ Home } />);

        await new Promise((resolve) => setTimeout(resolve, 25));

        expect(updater).toHaveBeenCalledTimes(1);
        expect(updater).toHaveBeenCalledWith({ variant: 'light' });

        expect(getByTestId('layout')).toHaveClass('primary-layout dark foo');
        expect(getByTestId('page')).toHaveClass('home');
    });

    it('should be reset whenever page changes', async () => {
        const updater = jest.fn(() => ({ variant: 'dark' }));
        const Home = withLayout(<PrimaryLayout />)(createPageWithLayoutProps('home', updater));
        const About = withLayout(<PrimaryLayout />)(createPage('about'));

        const { getByTestId, rerender } = render(<LayoutManager Component={ Home } />);

        await new Promise((resolve) => setTimeout(resolve, 25));

        expect(getByTestId('layout')).toHaveClass('primary-layout dark');
        expect(getByTestId('page')).toHaveClass('home');

        rerender(<LayoutManager Component={ About } />);

        expect(getByTestId('layout')).not.toHaveClass('dark');
        expect(getByTestId('page')).toHaveClass('about');
    });

    it('should not be injected if not wrapped with withLayout', () => {
        const Home = jest.fn(createPage('about'));

        render(<LayoutManager Component={ Home } />);

        expect(Home).toHaveBeenCalledTimes(1);
        expect(Home).toHaveBeenCalledWith({}, {});
    });
});
