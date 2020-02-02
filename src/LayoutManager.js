import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getLayoutFromPage, shouldInjectSetLayoutProp } from './with-layout';

const DummyLayout = ({ children }) => children;

export default class LayoutManager extends Component {
    static propTypes = {
        Component: PropTypes.elementType.isRequired,
        pageProps: PropTypes.object,
        defaultLayout: PropTypes.element,
        children: PropTypes.func,
    };

    static defaultProps = {
        defaultLayout: <DummyLayout />,
        children: ({ Layout, layoutProps, Component, pageProps }) => (
            <Layout { ...layoutProps }>
                <Component { ...pageProps } />
            </Layout>
        ),
    };

    static getDerivedStateFromProps(props, state) {
        const { Component, pageProps, defaultLayout } = props;
        const { layoutCounter = 0, pageCounter = 0 } = state;

        const { Layout, layoutProps } = getLayoutFromPage(Component, pageProps, defaultLayout);

        const didLayoutChanged = Layout !== state.Layout;
        const didPageChanged = props.Component !== state.Component;

        return {
            Layout,
            layoutProps: didPageChanged ? layoutProps : state.layoutProps,
            layoutCounter: didLayoutChanged ? layoutCounter + 1 : layoutCounter,
            pageCounter: didPageChanged ? pageCounter + 1 : pageCounter,
            Component: props.Component,
        };
    }

    state = {};

    render() {
        const { Component, pageProps, children } = this.props;
        const { Layout, layoutProps, layoutCounter, pageCounter } = this.state;

        const layoutKey = `layout-${layoutCounter.toString()}`;
        const pageKey = `page-${pageCounter.toString()}`;
        const finalPageProps = shouldInjectSetLayoutProp(Component) ?
            { setLayoutProps: this.setLayoutProps, ...pageProps } : pageProps;

        return children({
            Layout,
            layoutProps,
            layoutKey,
            Component,
            pageProps: finalPageProps,
            pageKey,
        });
    }

    setLayoutProps = (layoutProps) => {
        if (typeof layoutProps === 'function') {
            layoutProps = layoutProps(this.state.layoutProps);
        }

        this.setState((state) => ({
            layoutProps: { ...state.layoutProps, ...layoutProps },
        }));
    };
}
