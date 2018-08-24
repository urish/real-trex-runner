# Espruino build for Chrome T-Rex Game In-RealLife

Download [latest patched Espruino firmware build](espruino-1v99.170.zip)

## Build instructions

1. Clone Espruino repo:
```shell
git clone https://github.com/espruino/Espruino
```

2. Copy stepper-motor.diff and apply it:
```shell
git apply stepper-motor.diff
```

3. build Espruino for NRF52832DK by running the following commands:
```shell
source scripts/provision.sh NRF52832DK
make clean && make BOARD=NRF52832DK RELEASE=1
```

4. Use OpenOCD (or a similar tool) to flash espruino_*_nrf52832.hex to your board
