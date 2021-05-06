import React, { useContext, useMemo, forwardRef, useEffect, useRef } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import useObjectState from './util/use-object-state';
import LayoutContext from './util/context';

const toFunction = (fn) => typeof fn === 'function' ? fn : () => fn;

const getInitialLayoutTreeSymbol = Symbol('getInitialLayoutTreeSymbol');

const withLayout = (mapLayoutStateToLayoutTree, mapPropsToInitialLayoutState) => {
    const shouldInjectLayoutStateProps = typeof mapLayoutStateToLayoutTree === 'function';

    mapLayoutStateToLayoutTree = toFunction(mapLayoutStateToLayoutTree);
    mapPropsToInitialLayoutState = toFunction(mapPropsToInitialLayoutState);

    return (Component) => {
        const WithLayout = forwardRef((_props, ref) => {
            const { pageKey, props } = useMemo(() => {
                const { pageKey, ...props } = _props;

                return { pageKey, props };
            }, [_props]);

            const initialLayoutStateRef = useRef();

            if (!initialLayoutStateRef.current) {
                initialLayoutStateRef.current = mapPropsToInitialLayoutState(props);
            }

            const layoutProviderValue = useContext(LayoutContext);

            // Check if <LayoutTree /> was not added to the app (missing provider).
            if (process.env.NODE_ENV !== 'production' && !layoutProviderValue) {
                throw new Error('It seems you forgot to include <LayoutTree /> in your app');
            }

            const { updateLayoutTree, Component: ProviderComponent, pageKey: providerPageKey } = layoutProviderValue;
            const [layoutState, setLayoutState] = useObjectState(initialLayoutStateRef.current);

            useEffect(() => {
                if (layoutState !== initialLayoutStateRef.current &&
                    ProviderComponent === WithLayout &&
                    providerPageKey === pageKey
                ) {
                    updateLayoutTree(mapLayoutStateToLayoutTree(layoutState));
                }
            }, [layoutState, updateLayoutTree, ProviderComponent, providerPageKey, pageKey]);

            return useMemo(() => (
                <Component
                    ref={ ref }
                    { ...(shouldInjectLayoutStateProps ? { layoutState, setLayoutState } : {}) }
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

export const isComponentWrapped = (Component) => !!Component[getInitialLayoutTreeSymbol];

export default withLayout;
