# T-Rex Game Firmware for Raspberry Pi

## Installation

1. Enable the serial port and the SPI interface:
   1. Run `sudo raspi-config`
   2. Go to "5 - Interfacing Options"
   3. Select "P4 SPI" and then answer "Yes" to enable SPI
   4. Select "P6 Serial" and answer "No" for the first question (shell accessible over serial), and "Yes" to the second question (enable the serial port hardware)

   The serial port is used by the sound module, and the SPI interface is used by the display.

2. Configure the Pi to disable the stepper motors and turn the LED on when booting. Add the following lines at the end of `/boot/config.txt`:

   ```
   # T-Rex default pin configuration
   gpio=4=op,dl
   gpio=27=op,dl
   gpio=6=op,dl
   ```

3. Install yarn and nodejs, as [explained here](https://yarnpkg.com/lang/en/docs/install/#debian-stable)
  
4. Git clone this repository:

   `cd /home/pi && git clone https://github.com/urish/real-trex-runner/`

5. Install all dependencies using yarn:

   `cd /home/pi/real-trex-runner/firmware && yarn`

6. Configure systemd to load the application on system start:

   1. Create a file called `/lib/systemd/system/trex.service` with the following content:

      ```
      [Unit]
      Description=T-Rex Game
      After=local-fs.target sysinit.target
   
      [Service]
      ExecStart=/usr/bin/nodejs /home/pi/real-trex-runner/firmware/src/   trex.js
      User=pi
      Group=pi
   
      [Install]
      WantedBy=basic.target
      ```

   2. Enable the new service by running `sudo systemctl enable trex`

7. Cross your fingers and reboot the Pi. 🤞
