#!/bin/sh
# Builds voice-model.js + voice-model.wasm inside the emscripten/emsdk container.
set -e
LIB=/work/lib
cd "$LIB"
SRCS=$(find tflite-model edge-impulse-sdk/dsp edge-impulse-sdk/classifier edge-impulse-sdk/porting/clib \
         edge-impulse-sdk/tensorflow -name '*.cpp' -o -name '*.cc' -o -name '*.c' \
       | grep -v -e '/examples/' -e 'CMSIS' -e '/test' )
mkdir -p /work/out/obj
OBJS=""
for f in $SRCS; do
  o="/work/out/obj/$(echo "$f" | tr '/.' '__').o"
  case "$f" in
    *.c) emcc -O3 -c "$f" -o "$o" $FLAGS -I. ;;
    *)   em++ -O3 -std=c++17 -c "$f" -o "$o" $FLAGS -I. ;;
  esac
  OBJS="$OBJS $o"
done
em++ -O3 -std=c++17 $FLAGS -I. /work/wasm/voice.cpp $OBJS -o /work/out/voice-model.js \
  -s MODULARIZE=1 -s EXPORT_ES6=1 -s EXPORT_NAME=createVoiceModel \
  -s ALLOW_MEMORY_GROWTH=1 -s ENVIRONMENT=web,node \
  -s EXPORTED_RUNTIME_METHODS='["UTF8ToString","HEAPF32"]' \
  -s EXPORTED_FUNCTIONS='["_audio_buffer","_sample_count","_sample_rate","_label_count","_label","_classify","_dsp_ms","_nn_ms","_malloc","_free"]'
ls -la /work/out/voice-model.*
