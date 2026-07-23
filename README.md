# ClipLite

> A clean, cross-platform, open-source clipboard manager.
> An alternative to [Paste](https://pasteapp.io) ($29.99/yr), built with [Tauri](https://tauri.app) and [React](https://react.dev).

---

## Why ClipLite?

| | Paste | CopyQ | Maccy | Ditto | **ClipLite** |
|---|---|---|---|---|---|
| **Open source** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Cross-platform** | ❌ Mac only | ✅ | ❌ Mac only | ❌ Win only | ✅ |
| **Modern UI** | ✅ | ❌ Clunky | ⭐ Decent | ❌ Dated | ✅ |
| **Keyboard-first** | ⭐ | ✅ | ✅ | ✅ | ✅ |
| **Price** | $29.99/yr | Free | Free | Free | **Free** |

---

## Features

- **Global shortcut** — `Ctrl+Shift+V` opens ClipLite from anywhere
- **Clipboard history** — Never lose what you copied. Stores last 500 entries.
- **Instant search** — Filter by typing. Find anything in milliseconds.
- **Pin favorites** — Keep important clips permanently.
- **Full keyboard nav** — Arrow keys, Enter, Delete. No mouse needed.
- **Dark mode** — System-aware with manual toggle.
- **Lightweight** — Native performance via Rust + Tauri (~10 MB).
- **Accessible** — ARIA labels, focus management, reduced-motion support.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl+Shift+V` | Toggle ClipLite |
| `↑` `↓` | Navigate clips |
| `Enter` | Paste selected clip |
| `Delete` / `Backspace` | Delete selected clip |
| `Esc` | Close ClipLite |
| Type to search | Filter clip list |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop framework | [Tauri v2](https://v2.tauri.app) |
| Frontend | React 18 + TypeScript + TailwindCSS |
| Backend | Rust |
| Database | SQLite (bundled, zero-config) |
| Clipboard | [arboard](https://crates.io/crates/arboard) |
| Hotkeys | Tauri global shortcut plugin |
| Design system | Custom tokens + CSS custom properties |

---

## Design Principles

ClipLite follows three design skill standards from [skills.sh](https://skills.sh):

| Skill | Applied |
|---|---|
| **frontend-design** (Anthropic) | Distinctive token system, signature "bookmark spine" element, intentional palette |
| **web-design-guidelines** (Vercel) | Full accessibility audit, keyboard handlers, focus management, ARIA roles |
| **emil-design-eng** (Emil Kowalski) | No animation on high-frequency actions, `active:scale(0.92)` button feedback, `prefers-reduced-motion`, transition-only animations |

**Key design decisions:**
- The toggle (`Ctrl+Shift+V`) has **zero animation** — it's used 100+ times/day
- Clip items use only `opacity` and `transform` (GPU-composited)
- The bookmark spine is the single signature element — everything else is restrained
- Custom easing: `cubic-bezier(0.23, 1, 0.32, 1)` for responsive feel

---

## Getting Started

### Prerequisites

| OS | Requirements |
|---|---|
| **All** | [Node.js](https://nodejs.org) 18+, [Rust](https://rustup.rs) |
| **Linux** | `sudo apt install libwebkit2gtk-4.1-dev libxdo-dev libappindicator3-dev librsvg2-dev` |
| **Mac** | Xcode Command Line Tools |
| **Windows** | Microsoft Visual Studio C++ Build Tools |

### Install & Run

```bash
git clone https://github.com/cliplite/cliplite.git
cd cliplite
npm install
npm run tauri dev
```

### Build Release

```bash
npm run tauri build
# Output in src-tauri/target/release/bundle/
```

---

## Project Structure

```
cliplite/
├── src/                         # React frontend
│   ├── components/
│   │   ├── ClipItem.tsx         # Clip row with bookmark spine
│   │   ├── ClipList.tsx         # Scrollable list with empty state
│   │   └── SearchBar.tsx        # Search input with typeahead
│   ├── App.tsx                  # Main app: keyboard nav, events, state
│   ├── main.tsx                 # Entry point
│   ├── types.ts                 # TypeScript types
│   └── index.css                # Design tokens + global styles
├── src-tauri/                   # Rust backend
│   ├── src/
│   │   ├── lib.rs               # Tauri commands, monitor setup
│   │   ├── main.rs              # Binary entry point
│   │   ├── db.rs                # SQLite: CRUD, dedup, cleanup
│   │   └── clipboard.rs         # OS clipboard polling + copy
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/default.json
│   └── icons/icon.png
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── LICENSE
```

---

## Contributing

ClipLite is maintained entirely through AI-assisted development. Bug reports and feature requests are welcome on [GitHub Issues](https://github.com/cliplite/cliplite/issues).

---

## License

[Apache 2.0](LICENSE) — free for any use, personal or commercial.

---

Built with ❤️ by AI and the open-source community.  
Design informed by [skills.sh](https://skills.sh) — anthropics/frontend-design, vercel-labs/web-design-guidelines, emilkowalski/emil-design-eng.
