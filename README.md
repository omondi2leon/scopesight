# PRD Creator

A local-first, AI-powered Product Requirements Document creator.

## Features

- **Split-pane UI**: Chat with AI on the left, edit PRD on the right.
- **Deepseek Integration**: Secure API key storage, smart prompt engine.
- **Real-time Editor**: Monaco-based Markdown editor.
- **Export**: PDF (via Print), Markdown.
- **Persistence**: Auto-saves your work locally.

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   cd prd-app
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## API Key Setup

1. Open the application.
2. Click on "Settings" in the top right corner.
3. Enter your Deepseek API Key (starts with `sk-...`).
4. Click "Save Configuration".

## Troubleshooting

- **API Key not saving**: Ensure you are running on a supported OS (Windows/Mac/Linux) where `safeStorage` is available.
- **Network Errors**: Check your internet connection and verify Deepseek API status.
- **CSP Errors**: If you see Content Security Policy errors in console, check `index.html`.

## Tech Stack

- Electron
- React + Vite
- Tailwind CSS
- Monaco Editor
- Zustand (State Management)
