import React, { useContext, useMemo, forwardRef, useEffect, useRef } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import useClassState from './util/use-class-state';
import LayoutContext from './util/context';

const toFunction = (fn) => typeof fn === 'function' ? fn : () => fn;

const getInitialLayoutTreeSymbol = Symbol('getInitialLayoutTreeSymbol');

const withLayout = (mapLayoutStateToLayoutTree, mapPropsToInitialLayoutState) => {
    const shouldInjectSetLayoutState = typeof mapLayoutStateToLayoutTree === 'function';

    mapLayoutStateToLayoutTree = toFunction(mapLayoutStateToLayoutTree);
    mapPropsToInitialLayoutState = toFunction(mapPropsToInitialLayoutState);

    return (Component) => {
        const WithLayout = forwardRef((props, ref) => {
            const initialLayoutStateRef = useRef();

            if (!initialLayoutStateRef.current) {
                initialLayoutStateRef.current = mapPropsToInitialLayoutState(props);
            }

            const { updateLayoutTree } = useContext(LayoutContext);
            const [layoutState, setLayoutState] = useClassState(initialLayoutStateRef.current);

            useEffect(() => {
                if (layoutState !== initialLayoutStateRef.current) {
                    updateLayoutTree(mapLayoutStateToLayoutTree(layoutState));
                }
            }, [layoutState, updateLayoutTree]);

            return useMemo(() => (
                <Component
                    ref={ ref }
                    { ...(shouldInjectSetLayoutState ? { setLayoutState } : {}) }
                    { ...props } />
            ), [ref, setLayoutState, props]);
        });

        const getInitialLayoutTree = (props) => {
            const layoutState = mapPropsToInitialLayoutState(props);

            return mapLayoutStateToLayoutTree(layoutState);
        };

        Object.defineProperty(WithLayout, getInitialLayoutTreeSymbol, { value: getInitialLayoutTree });

        WithLayout.displayName = `WithLayout(${Component.displayName || Component.name || 'Component'})`;
        hoistNonReactStatics(WithLayout, Component);

        return WithLayout;
    };
};

export const getInitialLayoutTree = (Component, pageProps) => Component[getInitialLayoutTreeSymbol]?.(pageProps);

export default withLayout;
