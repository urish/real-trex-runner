from machine import UART, Pin
import time

SOUND_JUMP = 1
SOUND_LEVELUP = 2
SOUND_GAMEOVER = 3


class DFPlayer:
    def __init__(self, uart_id=1, tx_pin=Pin(4), baudrate=9600):
        self.uart = UART(uart_id, baudrate=baudrate, tx=tx_pin)

    def _send_command(self, cmd: int, arg1: int, arg2: int):
        # Create the command data packet
        data = [0x7E, 0xFF, 0x06, cmd, 0x00, arg1, arg2, 0x00, 0x00, 0xEF]
        # Calculate the checksum
        checksum = 0 - sum(data[1:7])
        data[7] = (checksum >> 8) & 0xFF
        data[8] = checksum & 0xFF
        # Send the command
        self.uart.write(bytearray(data))
        time.sleep(0.05)  # Small delay to allow the command to process

    def play_sound(self, track_id: int, volume=None):
        if volume is not None:
            self._send_command(0x06, 0x00, volume)
        self._send_command(0x12, 0x00, track_id)


# Example usage:
# player = DFPlayer()
# player.play_sound(1, volume=20)
