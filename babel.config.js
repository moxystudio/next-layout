'use strict';

module.exports = (api) => {
    api.cache(true);

    return {
        ignore: process.env.BABEL_ENV ? ['**/*.test.js', '**/__snapshots__', '**/__mocks__', '**/__fixtures__'] : [],
        presets: [
            ['@moxy/babel-preset/lib', { react: true }],
        ],
    };
};
