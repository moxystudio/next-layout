import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import LayoutContext from './util/context';
import createFullTree from './util/full-tree';
import { getInitialLayoutTree, isComponentWrapped } from './with-layout';

const LayoutProvider = LayoutContext.Provider;

export default class LayoutTree extends PureComponent {
    static propTypes = {
        Component: PropTypes.elementType.isRequired,
        pageProps: PropTypes.object,
        pageKey: PropTypes.string,
        defaultLayout: PropTypes.element,
        children: PropTypes.func,
    };

    static defaultProps = {
        children: (rootNode) => rootNode,
    };

    static getDerivedStateFromProps(props, state) {
        const { Component, pageProps, pageKey } = props;

        const didPageChange = Component !== state.Component || pageKey !== state.pageKey;
        const layoutTree = didPageChange ? getInitialLayoutTree(Component, pageProps) : state.layoutTree;

        return {
            Component,
            pageKey,
            layoutTree,
        };
    }

    state = {};

    // eslint-disable-next-line react/sort-comp
    updateLayoutTree = (layoutTree) => this.setState({ layoutTree });

    getProviderValue = memoizeOne((Component, pageKey) => ({
        Component,
        pageKey,
        updateLayoutTree: this.updateLayoutTree,
    }));

    render() {
        const { defaultLayout, Component, pageProps, pageKey, children: render } = this.props;
        const { layoutTree } = this.state;

        // Do not forward pageKey if the component is not wrapped, otherwise it would cause
        // an error if props were spreaded into a DOM element:
        // "React does not recognize the `pageKey` prop on a DOM element".
        const isWrapped = isComponentWrapped(Component);
        const page = <Component { ...pageProps } { ...(isWrapped && { pageKey }) } key={ pageKey } />;

        const fullTree = createFullTree(layoutTree ?? defaultLayout, page);
        const providerValue = this.getProviderValue(Component, pageKey);

        return (
            <LayoutProvider value={ providerValue }>
                { render(fullTree) }
            </LayoutProvider>
        );
    }
}
