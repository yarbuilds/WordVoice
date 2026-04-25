<h1 align="center">
  <br>
  WordVoice
  <br>
</h1>

<h4 align="center">A lightning-fast, system-wide desktop dictation tool built with Tauri and Rust.</h4>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#how-it-works">How it Works</a> •
  <a href="#installation">Installation</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#license">License</a>
</p>

---

## What is WordVoice?

WordVoice is a desktop application designed to replace and upgrade standard macOS dictation. By using a global hotkey, you can speak anywhere on your system and have your speech instantly transcribed and pasted exactly where your text cursor is located. WordVoice comes packed with support for powerful local AI models (via Whisper) and blazing-fast cloud APIs (via Groq), providing highly accurate, low-latency transcriptions right out of the box.

## Features

- **Global Hotkey & Typing Simulation:** Press your custom hotkey anywhere on your system to start dictation. Once processed, your text is automatically pasted right into the active window.
- **Local & Cloud Processing:**
  - **Local Engine (Whisper):** Download and run models locally for total privacy and offline transcription.
  - **Cloud Engine (Groq):** Bring your own Groq API key for ultra-low latency inference using state-of-the-art models.
- **Push-To-Talk or Toggle:** Choose between a classic push-to-talk experience or a toggle mode.
- **Custom Dictionary:** Add word mappings to correct commonly misheard words or set up personalized text-expansion macros (e.g., replace "my email" with "example@gmail.com").
- **Transcription History:** View, copy, or paste previous dictations from your in-app history.
- **Recording Overlay:** Provides an unobtrusive but clear "always-on-top" indicator when the microphone is listening or transcribing.
- **Clipboard Management:** Optionally keep transcribed text in your clipboard or restore previous clipboard data automatically.

## How it Works

1. **Trigger:** Hit your system-wide shortcut (e.g. `Cmd+Space`) to wake up the app.
2. **Speak:** Give your command or dictate your thoughts.
3. **Transcribe:** The application routes the audio recording to the engine of your choice (Local Whisper or Cloud Groq).
4. **Paste:** Uses `osascript` and `arboard` under the hood to simulate a paste command (`Cmd+V`) so the words magically appear wherever your cursor is focused.

## Installation

### Prerequisites
- Node.js (v16+)
- Rust & Cargo
- [Tauri dependencies](https://tauri.app/v1/guides/getting-started/prerequisites)

### running locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/yarmuhammad/WordVoice.git
   cd WordVoice
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run tauri dev
   ```

4. **Build for release**
   ```bash
   npm run tauri build
   ```

## Tech Stack

WordVoice is a modern desktop app utilizing:
* **[Tauri](https://tauri.app/)** - Application framework for building tiny, blazing fast binaries
* **[Rust](https://www.rust-lang.org/)** - Core backend logic, audio recording with `cpal`, and audio encoding/history
* **[Vite](https://vitejs.dev/) + TypeScript** - Fast frontend compilation and tooling
* **[Groq API](https://groq.com/)** - Cloud LLM inference
* **[Whisper](https://github.com/openai/whisper) / Local** - On-device AI processing

## License

MIT
