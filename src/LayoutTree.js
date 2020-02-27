import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import LayoutContext from './util/context';
import createFullTree from './util/full-tree';
import { getInitialLayoutTree } from './with-layout';

const LayoutProvider = LayoutContext.Provider;

export default class LayoutTree extends PureComponent {
    static propTypes = {
        Component: PropTypes.elementType.isRequired,
        pageProps: PropTypes.object,
        defaultLayout: PropTypes.element,
        children: PropTypes.func,
    };

    static defaultProps = {
        children: (rootNode) => rootNode,
    };

    static getDerivedStateFromProps(props, state) {
        const { Component, pageProps } = props;

        const didPageChanged = props.Component !== state.Component;
        const layoutTree = didPageChanged ? getInitialLayoutTree(Component, pageProps) : state.layoutTree;

        return {
            Component,
            layoutTree,
        };
    }

    state = {};

    providerValue = {
        updateLayoutTree: (layoutTree) => this.setState({ layoutTree }),
    };

    render() {
        const { defaultLayout, Component, pageProps, children: render } = this.props;
        const { layoutTree } = this.state;

        const page = <Component { ...pageProps } />;
        const fullTree = createFullTree(layoutTree ?? defaultLayout, page);

        return (
            <LayoutProvider value={ this.providerValue }>
                { render(fullTree) }
            </LayoutProvider>
        );
    }
}
