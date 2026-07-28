#!/system/bin/sh
set -x
source weston_start.sh
source /etc/im.conf
export encoderShowFps=1

pkill -9 gui
sleep 3
  
echo "3840x2176@30 freedom-------------------"
gst-launch-1.0 -e imcamsrc name=src usecase-mode=0x8056 custom-sensor-size=4096x3584 sensor-mode=42 pnp-mode=1 \
src.video_0 ! "video/x-raw(memory:DMABuf),width=696,height=392,format=NV12,usage=0x00000100,framerate=30/1"  ! queue ! imvtransform rotate=90CCW ! "video/x-raw(memory:DMABuf),format=BGRA" ! waylandsink sync=false qos=false direct-display=true display=DSI-2 async=false \
src.video_1 ! "video/x-raw(memory:DMABuf),width=3840,height=2176,format=NV15_32L4_8,usage=0x10000001,framerate=30/1, colorimetry=bt709-full" ! queue ! imvenc target-bitrate=90000000 idr-interval=60 ! h265parse ! qtmux name=mux interleave-time=25000000 ! imfilesink location=/mnt/sdcard/3840x2176_30_ainr_yuvflow_sensormode42.mp4 async=false \
pulsesrc buffer-time=2000000 do-timestamp=true provide-clock=false ! audio/x-raw,format=S16LE,channels=4,rate=48000 ! queue ! audioconvert ! fdkaacenc bitrate=320000 ! aacparse ! mux.
