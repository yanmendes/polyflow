module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json'
    }
  },
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testMatch: ['**/**/*.test.(ts|js)'],
  testPathIgnorePatterns: ['node_modules', 'dist'],
  preset: 'ts-jest'
}
