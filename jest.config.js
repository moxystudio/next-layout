'use strict';

const { compose, baseConfig } = require('@moxy/jest-config-base');
const withWeb = require('@moxy/jest-config-web');
const { withEnzymeWeb } = require('@moxy/jest-config-enzyme');

module.exports = compose(
    baseConfig(),
    withWeb(),
    withEnzymeWeb('enzyme-adapter-react-16'), // ⚠️ Always after .withWeb
);
