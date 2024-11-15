"""
Real Life Lonely T-Rex Game Firmware

Copyright (C) 2017-2024, Uri Shaked
"""

from framebuf import MONO_HLSB, FrameBuffer


class Asset(FrameBuffer):
    @staticmethod
    def load(file_path: str):
        """Loads a bitmap from a text file and returns it as an Asset object."""
        with open(file_path, "r") as file:
            bitmap = list(file.read().splitlines())

        height = len(bitmap)
        # Width is the length of the first row
        width = len(bitmap[0]) if height > 0 else 0

        asset = Asset(bytearray(width * height // 8), width, height, MONO_HLSB)
        asset.fill(1)

        for y, row in enumerate(bitmap):
            for x, char in enumerate(row):
                if char == "#":
                    asset.pixel(x, y, 0)

        return asset

    def __init__(
        self, buffer: bytearray, width: int, height: int, format: int, *args, **kwargs
    ):
        super().__init__(buffer, width, height, format, *args, **kwargs)
        self.buffer = buffer
        self.width = width
        self.height = height
        self.format = format
