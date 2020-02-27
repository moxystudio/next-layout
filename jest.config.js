const { compose, baseConfig, withEnzyme } = require('@moxy/jest-config');

module.exports = compose([
    baseConfig,
    withEnzyme('enzyme-adapter-react-16'),
]);
