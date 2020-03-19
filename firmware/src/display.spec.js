const spiInstance = {
  transferSync: jest.fn(),
};

jest.doMock('spi-device', () => ({
  openSync: () => spiInstance
}), { virtual: true });
jest.mock('onoff', () => ({
  Gpio: jest.fn(() => ({
    writeSync: jest.fn(),
    readSync: jest.fn(),
  })),
}), { virtual: true });

describe('display module', () => {
  const zero = Buffer.from([255, 0, 127, 255, 0, 127, 248, 0, 15, 248, 0, 15, 248, 0, 15, 199, 255, 129, 199, 255, 129, 199, 255, 129, 199, 255, 241, 199, 255, 241, 192, 255, 241, 192, 255, 241, 192, 0, 1, 248, 0, 15, 248, 0, 15, 255, 0, 127, 255, 0, 127, 255, 0, 127, 255, 255, 255]);

  describe('writeChar', () => {
    it('should display the given buffer to the screen, line by line', () => {
      const display = require('./display');
      const { start, writeChar } = display;
      start();
      writeChar(zero, 24, 19, 0, 0);
      expect(spiInstance.transferSync.mock.calls).toMatchSnapshot();
    });
  });
});
