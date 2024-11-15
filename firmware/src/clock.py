"""
Real Life Lonely T-Rex Game Firmware

Copyright (C) 2017-2024, Uri Shaked
"""

import time
from game_assets import assets
from machine import Timer

## Hardware
from machine import Pin, SPI
from display import Display

spi = SPI(0, 2000000, sck=Pin(6), mosi=Pin(7))
cs = Pin(5)
dc = Pin(8)
rst = Pin(9)
busy = Pin(10)
display = Display(spi, cs, dc, rst, busy)
###

update_timer = Timer(-1)


def zero_pad(val):
    return f"{val:02}"


def display_time(tm: time.struct_time):
    hours = tm[3]
    minutes = tm[4]
    display.clear()
    x = 40
    display.draw_string(zero_pad(hours), x, 220)
    display.draw_string(":", x, 220 - 74)
    display.draw_string(zero_pad(minutes), x, 220 - 130)
    display.update()


def clock_task(timer: Timer = None):
    tm = time.localtime()
    seconds = tm[5]
    time_to_update = 60000 - seconds * 1000 + 10
    display_time(tm)

    timer.init(mode=Timer.ONE_SHOT, period=time_to_update, callback=clock_task)


def stop():
    global update_timer
    update_timer.deinit()


def start():
    global update_timer
    stop()
    clock_task(update_timer)


if __name__ == "__main__":
    start()
