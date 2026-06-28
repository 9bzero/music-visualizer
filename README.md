# music-visualizer

Real-time audio visualizer using the Web Audio API. Play music from your microphone or an audio file and watch the frequency bars react.

## How it works

The Web Audio API's `AnalyserNode` gives a frequency-domain snapshot of the audio stream every frame via `getByteFrequencyData()`. Each bar in the visualization maps to a frequency bin — left side is bass, right side is treble. Canvas redraws at 60fps.

## Features

- Mic input or file upload
- Bar chart, waveform, and circular visualizer modes
- Color themes
- Adjustable FFT size (more bars = more detail, more CPU)

## Run

```bash
npm install && npm run dev
```

> Works best with headphones to avoid mic feedback.
