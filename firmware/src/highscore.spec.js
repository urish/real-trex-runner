let flashContent = new Uint8Array(256);
const FLASH_ADDR = 0x8000;
const Flash = {
  _set: (values) => {
    flashContent.fill(0xff);
    Flash.write(values, FLASH_ADDR);
  },
  write: jest.fn((data, addr) => {
    for (let i = 0; i < data.length; i++) {
      const target = addr - FLASH_ADDR + i;
      flashContent[target] = ~(~flashContent[target] | ~data[i]);
    }
  }),
  getFree: jest.fn().mockReturnValue([{ addr: FLASH_ADDR, length: 4096 }]),
  erasePage: jest.fn(() => {
    flashContent.fill(0xff);
  }),
};

jest.mock('Flash', () => Flash, { virtual: true });
let highscore = require('./highscore');
let mocks;

describe('highscore', () => {
  beforeEach(() => {
    mocks = {
      E: {
        memoryArea: jest.fn(() => String.fromCharCode(...flashContent)),
      }
    };

    flashContent.fill(0xff);
    Object.assign(global, mocks);
  });

  it('should return 0 when there is no stored highscore', () => {
    highscore.init();
    expect(mocks.E.memoryArea).toHaveBeenCalledWith(0x8000, 256);
    expect(highscore.get()).toBe(0);
  });

  it('should retrieve the last stored high score from memory', () => {
    Flash._set([0, 5, 0, 0xa]);
    highscore.init();
    expect(highscore.get()).toBe(10);
  });

  describe('set()', () => {
    it('should save the first high score at the beginning of the memory block', () => {
      highscore.init();
      highscore.set(0x50);
      expect(Flash.write).toHaveBeenCalledWith(new Uint8Array([0, 0x50, 0xff, 0xff]), 0x8000);
    });

    it('should save subsequent high score to the next memory location', () => {
      highscore.init();
      highscore.set(0x50);
      expect(Flash.write).toHaveBeenCalledWith(new Uint8Array([0, 0x50, 0xff, 0xff]), 0x8000);
    });

    it('should save subsequent high score to the next memory location', () => {
      Flash._set([0x0, 0x50]);
      highscore.init();
      highscore.set(0x250);
      expect(Flash.write).toHaveBeenCalledWith(new Uint8Array([0xff, 0xff, 2, 0x50]), 0x8000);
    });

    it('should erase the page if all slots are taken', () => {
      flashContent.fill(0x0);
      highscore.init();
      highscore.set(0x560);
      expect(Flash.erasePage).toHaveBeenCalledWith(0x8000);
      expect(Flash.write).toHaveBeenCalledWith(new Uint8Array([5, 0x60, 0xff, 0xff]), 0x8000);
    });
  });

  describe('integration', () => {
    it('should return the last saved score', () => {
      highscore.init();
      expect(highscore.get()).toBe(0);
      
      highscore.update(10);
      expect(highscore.get()).toBe(10);

      highscore.update(5);
      expect(highscore.get()).toBe(10);

      highscore.update(30);
     
      highscore.init();
      expect(highscore.get()).toBe(30);

      highscore.update(25);

      highscore.init();
      expect(highscore.get()).toBe(30);
    })
  });
});
