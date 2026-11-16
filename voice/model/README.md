# Voice model (WebAssembly)

`voice-model.wasm` is the Edge Impulse **DL_Project-3** keyword model from
[Real-Time-Voice-Command-Recognition-on-ESP32](https://github.com/PrithviHL/Real-Time-Voice-Command-Recognition-on-ESP32),
compiled for the browser. It contains the same C++ that runs on the ESP32: MFCC
preprocessing (13 coefficients, 25 ms frames, 15 ms stride, 40 filters), the
EON-compiled int8 network and the TensorFlow Lite Micro kernels.

- Input: 16,000 samples (1 s at 16 kHz), int16 scale.
- Output: probabilities for `down`, `left`, `off`, `on`, `right`, `up`.
- The model has no silence/noise class, so `../voice.js` only classifies after
  it detects speech, with a 1 s window centred on the word.

## Rebuild

From a folder containing the unzipped Arduino library
(`ei-dl_project-3-arduino-1.0.1.zip` → `DL_Project-3_inferencing/src`) as `lib/`,
this folder's `voice.cpp` and `build.sh` in `wasm/`, and an empty `out/`:

```bash
docker run --rm -v "$PWD/lib:/work/lib:ro" -v "$PWD/wasm:/work/wasm:ro" -v "$PWD/out:/work/out" \
  -e FLAGS="-DEI_PORTING_CLIB=1 -DEI_PORTING_POSIX=0 -DEI_PORTING_ARDUINO=0 -DEIDSP_USE_CMSIS_DSP=0 -DEIDSP_LOAD_CMSIS_DSP_SOURCES=0 -DEI_CLASSIFIER_TFLITE_ENABLE_CMSIS_NN=0 -DTF_LITE_DISABLE_X86_NEON=1 -Wno-everything" \
  emscripten/emsdk:3.1.64 sh /work/wasm/build.sh
```

Then copy `out/voice-model.js` and `out/voice-model.wasm` here.

Licences: Edge Impulse SDK (Clear BSD), TensorFlow Lite Micro (Apache 2.0).
