const layoutSymbol = Symbol('layout');

const withLayout = (mapToLayout) => (Component) => {
    const value = typeof mapToLayout === 'function' ? mapToLayout : () => mapToLayout;

    Object.defineProperty(Component, layoutSymbol, { value });

    return Component;
};

export const getLayoutFromPage = (Component, pageProps, defaultLayout) => {
    const layout = Component[layoutSymbol]?.(pageProps) ?? defaultLayout;

    return {
        Layout: layout?.type,
        layoutProps: layout?.props,
    };
};

export const shouldInjectSetLayoutProp = (Component) => !!Component[layoutSymbol];

export default withLayout;
