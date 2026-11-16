// Browser bridge for the Edge Impulse "DL_Project-3" keyword model.
// Runs the exact same MFCC preprocessing and int8 EON-compiled network that
// runs on the ESP32, compiled to WebAssembly with Emscripten.
#include <emscripten.h>
#include <string.h>
#include "edge-impulse-sdk/classifier/ei_run_classifier.h"

static float audio[EI_CLASSIFIER_RAW_SAMPLE_COUNT];
static float scores[EI_CLASSIFIER_LABEL_COUNT];
static int last_dsp_ms = 0;
static int last_nn_ms = 0;

static int get_audio(size_t offset, size_t length, float *out) {
  memcpy(out, audio + offset, length * sizeof(float));
  return 0;
}

extern "C" {

// JS writes 16 kHz samples (in int16 range, like the ESP32's I2S buffer) here.
EMSCRIPTEN_KEEPALIVE float *audio_buffer() { return audio; }
EMSCRIPTEN_KEEPALIVE int sample_count() { return EI_CLASSIFIER_RAW_SAMPLE_COUNT; }
EMSCRIPTEN_KEEPALIVE int sample_rate() { return EI_CLASSIFIER_FREQUENCY; }
EMSCRIPTEN_KEEPALIVE int label_count() { return EI_CLASSIFIER_LABEL_COUNT; }
EMSCRIPTEN_KEEPALIVE const char *label(int i) { return ei_classifier_inferencing_categories[i]; }
EMSCRIPTEN_KEEPALIVE int dsp_ms() { return last_dsp_ms; }
EMSCRIPTEN_KEEPALIVE int nn_ms() { return last_nn_ms; }

// Classify the current 1 s buffer. Returns a pointer to label_count() scores,
// or 0 on error.
EMSCRIPTEN_KEEPALIVE float *classify() {
  signal_t signal;
  signal.total_length = EI_CLASSIFIER_RAW_SAMPLE_COUNT;
  signal.get_data = &get_audio;
  ei_impulse_result_t result;
  memset(&result, 0, sizeof(result));
  if (run_classifier(&signal, &result, false) != EI_IMPULSE_OK) return 0;
  for (int i = 0; i < EI_CLASSIFIER_LABEL_COUNT; i++) scores[i] = result.classification[i].value;
  last_dsp_ms = result.timing.dsp;
  last_nn_ms = result.timing.classification;
  return scores;
}

}  // extern "C"
