const assets = require('./assets');

describe('assets', () => {
  it('should load assets', () => {
    expect(assets.colon).toBeDefined();
  });
});
