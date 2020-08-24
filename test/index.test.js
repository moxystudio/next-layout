import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { withLayout, LayoutTree } from '../src';

const PrimaryLayout = ({ children }) => <main>{ children }</main>;
const Home = () => <h1>Home</h1>;

afterEach(() => {
    console.error.mockRestore?.();
});

it('should render no layout', () => {
    const wrapper = mount(
        <LayoutTree
            Component={ Home }
            pageProps={ { foo: 'bar' } } />,
    );

    expect(wrapper).toMatchSnapshot();
});

it('should render default layout', () => {
    const wrapper = mount(
        <LayoutTree
            Component={ Home }
            pageProps={ { foo: 'bar' } }
            defaultLayout={ <PrimaryLayout /> } />,
    );

    expect(wrapper).toMatchSnapshot();
});

it('should render a one level deep layout tree correctly', () => {
    const EnhancedHome = withLayout(<PrimaryLayout />)(Home);

    const wrapper = mount(
        <LayoutTree
            Component={ EnhancedHome }
            pageProps={ { foo: 'bar' } } />,
    );

    expect(wrapper).toMatchSnapshot();
});

it('should render a two level deep layout tree correctly', () => {
    const AccountLayout = ({ children }) => <div>{ children }</div>;

    const layout = (
        <PrimaryLayout>
            <AccountLayout />
        </PrimaryLayout>
    );

    const EnhancedAccountInfo = withLayout(layout)(Home);

    const wrapper = mount(
        <LayoutTree
            Component={ EnhancedAccountInfo }
            pageProps={ { foo: 'bar' } } />,
    );

    expect(wrapper).toMatchSnapshot();
});

it('should call layout\'s and page\'s render just once', () => {
    const PrimaryLayoutMock = jest.fn(PrimaryLayout);
    const HomeMock = jest.fn(Home);

    const EnhancedHomeMock = withLayout(<PrimaryLayoutMock />)(HomeMock);

    mount(<LayoutTree Component={ EnhancedHomeMock } />);

    expect(PrimaryLayoutMock).toHaveBeenCalledTimes(1);
    expect(HomeMock).toHaveBeenCalledTimes(1);
});

it('should render a layout tree correctly based the initial layout state', () => {
    const mapLayoutStateToLayoutTree = jest.fn(({ variant }) => <PrimaryLayout variant={ variant } />);
    const EnhancedHome = withLayout(mapLayoutStateToLayoutTree, { variant: 'light' })(Home);

    const wrapper = mount(<LayoutTree Component={ EnhancedHome } />);

    expect(wrapper).toMatchSnapshot();
    expect(mapLayoutStateToLayoutTree).toHaveBeenCalledTimes(1);
    expect(mapLayoutStateToLayoutTree).toHaveBeenLastCalledWith({ variant: 'light' });
});

it('should render a layout tree correctly based the initial layout state (function)', () => {
    const mapLayoutStateToLayoutTree = jest.fn(({ variant }) => <PrimaryLayout variant={ variant } />);
    const mapPropsToInitialLayoutState = jest.fn(({ light }) => ({ variant: light ? 'light' : 'dark' }));

    const EnhancedHome = withLayout(mapLayoutStateToLayoutTree, mapPropsToInitialLayoutState)(Home);

    const wrapper = mount(
        <LayoutTree
            Component={ EnhancedHome }
            pageProps={ { light: true } } />,
    );

    expect(wrapper).toMatchSnapshot();
    expect(mapLayoutStateToLayoutTree).toHaveBeenCalledTimes(1);
    expect(mapLayoutStateToLayoutTree).toHaveBeenLastCalledWith({ variant: 'light' });
    expect(mapPropsToInitialLayoutState).toHaveBeenCalledTimes(2);
    expect(mapPropsToInitialLayoutState).toHaveBeenLastCalledWith({ light: true });
});

it('should update the layout tree correctly if setLayoutState is called', () => {
    const Home = ({ setLayoutState }) => {
        useEffect(() => {
            setLayoutState({ variant: 'dark' });
        }, [setLayoutState]);

        return <h1>Home</h1>;
    };

    const PrimaryLayoutMock = jest.fn(PrimaryLayout);
    const HomeMock = jest.fn(Home);

    const mapLayoutStateToLayoutTree = jest.fn(({ variant }) => <PrimaryLayoutMock variant={ variant } />);
    const EnhancedHomeMock = withLayout(mapLayoutStateToLayoutTree, { variant: 'light' })(HomeMock);

    mount(<LayoutTree Component={ EnhancedHomeMock } />);

    expect(PrimaryLayoutMock).toHaveBeenCalledTimes(2);
    expect(PrimaryLayoutMock).toHaveBeenNthCalledWith(1, { children: expect.anything(), variant: 'light' }, {});
    expect(PrimaryLayoutMock).toHaveBeenNthCalledWith(2, { children: expect.anything(), variant: 'dark' }, {});
    expect(HomeMock).toHaveBeenCalledTimes(2);
});

it('should update the layout tree correctly if Component changes', () => {
    const Foo = () => <h1>Foo</h1>;

    const EnhancedHome = withLayout(<PrimaryLayout variant="light" />)(Home);
    const EnhancedFoo = withLayout(<PrimaryLayout variant="dark" />)(Foo);

    const wrapper = mount(<LayoutTree Component={ EnhancedHome } />);

    expect(wrapper).toMatchSnapshot();

    wrapper.setProps({ Component: EnhancedFoo });

    expect(wrapper).toMatchSnapshot();
});

it('should update the layout tree correctly if pageKey changes', () => {
    let doSetLayoutState = true;

    const Home = ({ setLayoutState }) => {
        useEffect(() => {
            doSetLayoutState && setLayoutState({ variant: 'dark' });
        }, [setLayoutState]);

        return <h1>Home</h1>;
    };

    const mapLayoutStateToLayoutTree = jest.fn(({ variant }) => <PrimaryLayout variant={ variant } />);
    const EnhancedHome = withLayout(mapLayoutStateToLayoutTree, { variant: 'light' })(Home);

    const wrapper = mount(<LayoutTree Component={ EnhancedHome } pageKey="foo" />);

    expect(wrapper).toMatchSnapshot();

    doSetLayoutState = false;
    wrapper.setProps({ pageKey: 'bar' });

    expect(wrapper).toMatchSnapshot();
    expect(mapLayoutStateToLayoutTree).toHaveBeenCalledTimes(3);
});

it('should update the layout tree correctly if setLayoutState is called (function)', () => {
    expect.assertions(5);

    const Home = ({ setLayoutState }) => {
        useEffect(() => {
            setLayoutState((layoutState) => {
                expect(layoutState).toEqual({ variant: 'light' });

                return { variant: 'dark' };
            });
        }, [setLayoutState]);

        return <h1>Home</h1>;
    };

    const PrimaryLayoutMock = jest.fn(PrimaryLayout);
    const HomeMock = jest.fn(Home);

    const mapLayoutStateToLayoutTree = jest.fn(({ variant }) => <PrimaryLayoutMock variant={ variant } />);
    const EnhancedHomeMock = withLayout(mapLayoutStateToLayoutTree, { variant: 'light' })(HomeMock);

    mount(<LayoutTree Component={ EnhancedHomeMock } />);

    expect(PrimaryLayoutMock).toHaveBeenCalledTimes(2);
    expect(PrimaryLayoutMock).toHaveBeenNthCalledWith(1, { children: expect.anything(), variant: 'light' }, {});
    expect(PrimaryLayoutMock).toHaveBeenNthCalledWith(2, { children: expect.anything(), variant: 'dark' }, {});
    expect(HomeMock).toHaveBeenCalledTimes(2);
});

it('should not inject setLayoutState to pages if it is not needed', () => {
    const HomeMock = jest.fn(Home);
    const EnhancedHome = withLayout(<PrimaryLayout />)(HomeMock);

    mount(<LayoutTree Component={ EnhancedHome } />);

    expect(HomeMock).toHaveBeenCalledTimes(1);
    expect(HomeMock).toHaveBeenCalledWith({}, {});
});

it('should fail if layout tree is not unary', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const NewsletterForm = () => <form />;
    const AccountLayout = ({ children }) => <div>{ children }</div>;

    const layout = (
        <PrimaryLayout>
            <AccountLayout />
            <NewsletterForm />
        </PrimaryLayout>
    );

    const EnhancedHome = withLayout(layout)(Home);

    expect(() => mount(<LayoutTree Component={ EnhancedHome } />)).toThrow(/unary trees/i);
});

it('should allow passing a custom render prop to LayoutTree', () => {
    const EnhancedHome = withLayout(<PrimaryLayout />)(Home);

    const render = jest.fn((tree) => tree);

    const wrapper = mount(
        <LayoutTree
            Component={ EnhancedHome }
            pageProps={ { foo: 'bar' } }>
            { render }
        </LayoutTree>,
    );

    expect(wrapper).toMatchSnapshot();
    expect(render).toHaveBeenCalledTimes(1);
    expect(render.mock.results[0].value).toMatchSnapshot();
});

it('should fail if LayoutTree was not rendered', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const EnhancedHome = withLayout(<PrimaryLayout />)(Home);

    expect(() => {
        mount(
            <EnhancedHome />,
        );
    }).toThrow(/it seems you forgot to include/i);
});

it('should ignore setLayoutState calls if page is not the active Component of LayoutTree', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const Foo = ({ setLayoutState }) => {
        useEffect(() => {
            setLayoutState({ variant: 'dark' });
        }, [setLayoutState]);

        return <h1>Foo</h1>;
    };

    const mapLayoutStateToLayoutTree = jest.fn(({ variant }) => <PrimaryLayout variant={ variant } />);
    const EnhancedHome = withLayout(mapLayoutStateToLayoutTree, { variant: 'light' })(Home);
    const EnhancedFoo = withLayout(mapLayoutStateToLayoutTree, { variant: 'light' })(Foo);

    const render = jest.fn((tree) => (
        <>
            { tree }
            { <EnhancedFoo /> }
        </>
    ));

    const wrapper = mount(
        <LayoutTree Component={ EnhancedHome }>
            { render }
        </LayoutTree>,
    );

    expect(wrapper).toMatchSnapshot();
    expect(mapLayoutStateToLayoutTree).toHaveBeenCalledTimes(1);
});

it('should ignore setLayoutState calls if Component\'s pageKey is not the active pageKey of LayoutTree', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const Foo = ({ foo, setLayoutState }) => {
        useEffect(() => {
            foo && setLayoutState({ variant: 'dark' });
        }, [foo, setLayoutState]);

        return <h1>Foo</h1>;
    };

    const mapLayoutStateToLayoutTree = jest.fn(({ variant }) => <PrimaryLayout variant={ variant } />);
    const EnhancedFoo = withLayout(mapLayoutStateToLayoutTree, { variant: 'light' })(Foo);

    const render = jest.fn((tree) => (
        <>
            { tree }
            { <EnhancedFoo foo /> }
        </>
    ));

    const wrapper = mount(
        <LayoutTree Component={ EnhancedFoo } pageKey="foo">
            { render }
        </LayoutTree>,
    );

    expect(wrapper).toMatchSnapshot();
    expect(mapLayoutStateToLayoutTree).toHaveBeenCalledTimes(1);
});
