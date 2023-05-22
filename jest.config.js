export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
    moduleFileExtensions: ['js', 'mjs'],
  transformIgnorePatterns: [
    "node_modules/(?!(core-js)/)"
  ]
};
