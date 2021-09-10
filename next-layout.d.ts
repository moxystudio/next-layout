declare module "@moxy/next-layout" {
    import { ReactElement } from "react";
    import { NextComponentType, NextPageContext } from "next";

    export type InjectedPageProps<State = {}> = {
        setLayoutState: (
            state: State | ((currentState: State) => State)
        ) => void;
    };

    export function withLayout<State = {}, PageProps = {}>(
        layout:
            | ReactElement<PageProps>
            | ((state: State) => ReactElement<PageProps>),
        initialLayoutState?: State | ((props: PageProps) => State)
    ): (
        page: (props: InjectedPageProps & PageProps) => ReactElement
    ) => ReactElement;

    export function LayoutTree(props: {
        Component: NextComponentType<NextPageContext, any, {}>;
        pageProps: {};
        pageKey?: string;
        defaultLayout?: ReactElement;
        children?: (tree: ReactElement) => ReactElement;
    }): ReactElement;
}
