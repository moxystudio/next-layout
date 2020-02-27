# next-layout

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][build-status-image]][build-status-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

[npm-url]:https://npmjs.org/package/@moxy/next-layout
[downloads-image]:https://img.shields.io/npm/dm/@moxy/next-layout.svg
[npm-image]:https://img.shields.io/npm/v/@moxy/next-layout.svg
[build-status-url]:https://github.com/moxystudio/next-layout/actions
[build-status-image]:https://img.shields.io/github/workflow/status/moxystudio/next-layout/Node%20CI/master
[codecov-url]:https://codecov.io/gh/moxystudio/next-layout
[codecov-image]:https://img.shields.io/codecov/c/github/moxystudio/next-layout/master.svg
[david-dm-url]:https://david-dm.org/moxystudio/next-layout
[david-dm-image]:https://img.shields.io/david/moxystudio/next-layout.svg
[david-dm-dev-url]:https://david-dm.org/moxystudio/next-layout?type=dev
[david-dm-dev-image]:https://img.shields.io/david/dev/moxystudio/next-layout.svg

Add persistent and nested layouts to your Next.js projects in a declarative way.

## Installation

```sh
$ npm install @moxy/next-layout
```

This library is written in modern JavaScript and is published in both CommonJS and ES module transpiled variants. If you target older browsers please make sure to transpile accordingly.

## Motivation

Next.js projects usually have the need to have one or more layouts. Layouts are the "shell" of your app and usually contain navigation elements, such as an header and a footer. In more complex projects, you might also need to have nested layouts which are often associated with nested routes.

In the ideal scenario, each page would be able to say which layout they want to use, including tweaking its properties dynamically, such as `variant="light"`. However, we also want to keep the layout persistent in the React tree, to avoid having to remount it every time a user navigate between pages.

Historically, projects overlook the need of multiple layouts or the ability to change layout props between pages. They start off with a simple layout and only later they handle this need, often with poor and non-scalable solutions.

This library solves the need for multi-layouts and changing layout props dynamically in a consistent and reusable way.

## Usage

Setup `<LayoutTree>` in your `pages/_app.js` component:

```js
import React from 'react';
import { LayoutTree } from '@moxy/next-layout';

const App = ({ Component, pageProps }) => (
    <LayoutTree
        Component={ Component }
        pageProps={ pageProps } />
);

export default App;
```

...and then use `withLayout` in your page components, e.g.: in `pages/about.js`:

```js
import React from 'react';
import { withLayout } from '@moxy/next-layout';
import { PrimaryLayout } from '../components';
import styles from './about.module.css';

const About = () => (
    <div className={ styles.about }>
        <h1>About</h1>
    </div>
);

export default withLayout(<PrimaryLayout variant="light" />)(About);
```

ℹ️ The `PrimaryLayout` component will receive the page to be rendered as the `children` prop.

### Nested layouts

Nested layouts are as easy as nesting them in the `withLayout`. Let's say that you have two account pages, `pages/account/profile.js` and `pages/account/settings.js`, and you want them to be wrapped by an `AccountLayout`. You would define the pages like so:

```js
// pages/account/profile.js
import React from 'react';
import { withLayout } from '@moxy/next-layout';
import { PrimaryLayout, AccountLayout } from '../components';
import styles from './.account-profile.module.css';

const AccountProfile = () => (
    <div className={ styles.accountProfile }>
        <h1>Account Profile</h1>
    </div>
);

export default withLayout(
    <PrimaryLayout>
        <AccountLayout />
    <PrimaryLayout />
)(AccountProfile);
```

```js
// pages/account/settings.js
import React from 'react';
import { withLayout } from '@moxy/next-layout';
import { PrimaryLayout, AccountLayout } from '../components';
import styles from './account-settings.module.css';

const AccountSettings = () => (
    <div className={ styles.accountSettings }>
        <h1>Account Settings</h1>
    </div>
);

export default withLayout(
    <PrimaryLayout>
        <AccountLayout />
    <PrimaryLayout />
)(AccountSettings);
```

ℹ️ The `PrimaryLayout` component will receive `AccountLayout` as a children, which in turn will receive the page as children too.

ℹ️ You could create a `withAccountLayout` HOC to avoid repeating the layout tree in every account page.

⚠️ The layout tree specified in `withLayout` must be a unary tree, that is, a tree where nodes just have one child.

## API

`@moxy/next-layout` exposes a `<LayoutTree>` component and a `withLayout` HOC to be used in pages.

### &lt;LayoutTree&gt;

A component that infers the layout tree based on what the active page specifies. It keeps the layout persistent between page transitions whenever possible (e.g.: when the layout is the same).

Here's the list of props it supports:

#### Component

Type: `ReactElementType`

The page component, which maps to your App `Component` prop.

#### pageProps

Type: `object`

The page component props, which maps to your App `pageProps` prop.

#### defaultLayout

Type: `ReactElement`   

The default layout tree to be used when a child page doesn't explicitly sets one.

```js
// pages/_app.js
import React from 'react';
import { LayoutTree } from '@moxy/next-layout';
import { PrimaryLayout } from '../components';

const App = ({ Component, pageProps }) => (
    <LayoutTree
        Component={ Component }
        pageProps={ pageProps }
        defaultLayout={ <PrimaryLayout /> } />
);

export default App;
```

#### children

Type: `function`

A [render prop](https://reactjs.org/docs/render-props.html) to override the default render behavior, which just regularly renders the tree.

Its signature is `(tree) => <ReactElement>`, where: `tree` is the React's tree composed by layout elements and a leaf page element.

This might be useful if you want to add animations between page transitions.

### withLayout(mapLayoutStateToLayoutTree?, initialLayoutState?)(Page)

Sets up a `Page` component with the ability to specify which layout tree to use. Moreover, it injects a `setLayoutState` prop so that you may dynamically update the layout tree.

#### mapLayoutStateToLayoutTree

Type: `ReactElement` or `function`

In simple cases, you may defined a "static" layout tree, like so:

```js
export default withLayout(<PrimaryLayout variant="light" />)(Home);
```

However, you might be having external props, component state or other mutations influencing the layout tree. In those cases, you may pass a function that maps **layout state** into a tree, with the following signature: `(layoutState) => <ReactElement>`. Here's an example:

```js
const mapLayoutStateToLayoutTree = ({ variant }) => <PrimaryLayout variant={ variant } />;

export default withLayout(mapLayoutStateToLayoutTree, { variant: 'light' })(Home);
```

The function is run initially and every time the *layout state* changes.

#### initialLayoutState

Type: `object` or `function`

The initial **layout state** to be passed to `mapLayoutStateToLayoutTree`. If your initial *layout state* depends on the props you receive, you may pass a function with the following signature: `(props) => <object>`.

#### Page

Type: `ReactElementType`

The page component to wrap.

#### Injected setLayoutState

Type: `function`

Allows to dynamically change the layout state. Has the following signature: `(newState | updater?)`.

The behavior of `setLayoutState` is exactly the same as [`setState`](https://reactjs.org/docs/react-component.html#setstate) of class components: it merges properties and it supports both an object or an updater function.

```js
// pages/about.js
import React, { useCallback } from 'react';
import { withLayout } from '@moxy/next-layout';
import { PrimaryLayout } from '../components';

import styles from './about.module.css';

const About = ({ setLayoutState }) => {
    const handleSetToDark = useCallback(() => {
        setLayoutState({ variant="dark" });
        // ..or setLayoutState((layoutState) => ({ variant="dark" }));
    }, [setLayoutState]);

    return (
        <div className={ styles.about }>
            <h1>About</h1>
            <button onClick={ handleSetToDark }>Enable dark mode</button>
        </div>
    );
};

const mapLayoutStateToLayoutTree = ({ variant }) => <PrimaryLayout variant={ variant } />;

export default withLayout(mapLayoutStateToLayoutTree, { variant: "light" })(About);
```

## Tests

```sh
$ npm test
$ npm test -- --watch # during development
```

## License

Released under the [MIT License](https://www.opensource.org/licenses/mit-license.php).
