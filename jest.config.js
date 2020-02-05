const { compose, baseConfig, withRTL } = require('@moxy/jest-config');

module.exports = compose([
    baseConfig,
    withRTL,
]);

