# ScopeSight

**A beautiful, local-first, AI-powered Product Requirements Document generator.**

ScopeSight is a desktop application that helps product managers and teams create professional PRDs through conversational AI. Your data stays entirely on your machine — no cloud accounts, no subscriptions, no data collection.

## ✨ Features

- **Multi-Provider AI** — Supports **DeepSeek**, **OpenAI (GPT-4o)**, **Anthropic (Claude)**, and **Google Gemini**. Switch between models on the fly.
- **Split-Pane Editor** — Chat with AI on the left, see your PRD rendered in real-time on the right.
- **Monaco Code Editor** — Full Markdown editing with syntax highlighting, powered by the same editor as VS Code.
- **PDF & Markdown Export** — Export your documents as clean, multi-page PDFs or raw Markdown files.
- **DOCX Export** — Generate Word documents for stakeholders who prefer `.docx`.
- **Document History** — All your PRDs are automatically saved and browseable from the History page.
- **Encrypted API Keys** — Your provider API keys are encrypted using your OS's native secure storage (macOS Keychain / Windows Credential Manager).
- **100% Local & Private** — No sign-up, no cloud sync. Everything runs and saves on your computer.

## 📦 Download

Head to the [**Releases**](https://github.com/omondi2leon/scopesight/releases) page and download the latest installer:

| Platform | File |
|----------|------|
| macOS    | `ScopeSight-x.x.x.dmg` |
| Windows  | `ScopeSight-x.x.x-setup.exe` |

## 🛠 Development

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/omondi2leon/scopesight.git
cd scopesight

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Build

```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux
```

Build output will be in the `dist/` directory.

## ⚙️ Configuration

1. Launch ScopeSight.
2. Navigate to **Settings** (top-right corner).
3. Go to the **Security & APIs** tab.
4. Enter your API key for any supported provider:
   - **DeepSeek** — `sk-...`
   - **OpenAI** — `sk-...`
   - **Anthropic** — `sk-ant-...`
   - **Google Gemini** — `AI...`
5. Select your preferred model in the **General** tab, or use the inline model switcher in the chat panel.

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Electron + electron-vite |
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Editor | Monaco Editor |
| State | Zustand |
| Database | Dexie (IndexedDB) |
| AI SDKs | OpenAI, Anthropic, Google Generative AI |
| Build | electron-builder |
| CI/CD | GitHub Actions |

## 🔒 Privacy & Security

- **No telemetry.** ScopeSight does not phone home or collect any analytics.
- **No cloud storage.** All documents are saved to your local machine's IndexedDB.
- **Encrypted secrets.** API keys are encrypted via Electron's `safeStorage`, backed by your operating system's native credential manager.
- **Open source.** You can audit every line of code.

## 📄 License

MIT
