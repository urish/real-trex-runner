from framebuf import MONO_HLSB, FrameBuffer
from game_assets import assets
from lib import epaper2in9
from machine import SPI, Pin

WIDTH = 128
HEIGHT = 296


class Display:
    def __init__(self, spi: SPI, cs: Pin, dc: Pin, rst: Pin, busy: Pin):
        self.epd = epaper2in9.EPD(spi, cs, dc, rst, busy)
        self.epd.init()
        self._buf = bytearray(WIDTH * HEIGHT // 8)
        self.framebuf = FrameBuffer(self._buf, WIDTH, HEIGHT, MONO_HLSB)

    def clear(self):
        self.framebuf.fill(1)

    def draw_string(self, s: str, x: int, y: int, spacing=10, prefix=""):
        for c in s:
            gfx = assets[prefix + c]
            self.framebuf.blit(assets[prefix + c], x, y)
            y -= gfx.height + spacing

    def update(self):
        self.epd.set_frame_memory(self._buf, 0, 0, WIDTH, HEIGHT)
        self.epd.display_frame()
