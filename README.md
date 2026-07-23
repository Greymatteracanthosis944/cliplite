<!-- ═══════════════════════════════════════════════════════════
     ClipLite — README
     ═══════════════════════════════════════════════════════════ -->
<p align="center">
  <img src="https://raw.githubusercontent.com/codedbytahir/cliplite/main/src-tauri/icons/icon.png" width="96" height="96" alt="ClipLite logo" />
</p>

<h1 align="center">ClipLite</h1>
<p align="center"><strong>The clipboard manager that doesn't suck.</strong><br>Free. Open source. Cross-platform.</p>

<p align="center">
  <a href="https://github.com/codedbytahir/cliplite/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue?style=flat-square" alt="License"></a>
  <a href="https://github.com/codedbytahir/cliplite/stargazers"><img src="https://img.shields.io/github/stars/codedbytahir/cliplite?style=flat-square" alt="Stars"></a>
  <a href="https://github.com/codedbytahir/cliplite/pulse"><img src="https://img.shields.io/badge/maintained-yes-brightgreen?style=flat-square" alt="Maintained"></a>
</p>

<p align="center">
  <strong><a href="https://codedbytahir.github.io/cliplite/">🌐 Landing Page</a></strong>
  &middot;
  <strong><a href="#-keyboard-shortcuts">⌨️ Shortcuts</a></strong>
  &middot;
  <strong><a href="#-getting-started">📦 Install</a></strong>
  &middot;
  <strong><a href="#-project-structure">🧱 Architecture</a></strong>
  &middot;
  <strong><a href="#-contributing">🤝 Contribute</a></strong>
</p>

<hr>

## 🤔 What Is This?

ClipLite is a **clipboard manager**. Here's what that means in plain English:

> You know when you copy something, then copy something else, and the first thing is gone forever? ClipLite fixes that. It saves **everything** you copy — text, code, links — and lets you search through them anytime. Press `Ctrl+Shift+V` anywhere on your computer and a beautiful little window pops up with your entire copy history.

If you've ever:
- Copied a link, then copied something else, and lost the link
- Wanted to paste that code snippet you copied 3 hours ago but can't find it
- Wished you could save certain things you copy repeatedly (like email signatures)

...then ClipLite is for you.

---

## 📊 Why ClipLite Exists

| | **ClipLite** | Paste | CopyQ | Maccy | Ditto |
|---|---|---|---|---|---|
| **Price** | **Free forever** 💚 | $29.99/yr 🔴 | Free | Free | Free |
| **Open source** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Mac + Windows + Linux** | ✅ All three | ❌ Mac only | ✅ | ❌ Mac only | ❌ Win only |
| **Looks good** | ✅ Modern | ✅ Modern | ❌ Ugly | ⭐ OK | ❌ Dated |
| **Keyboard control** | ✅ Full | ✅ | ✅ | ✅ | ✅ |
| **Dark mode** | ✅ | ✅ | ✅ | Partial | ❌ |
| **App size** | ~10 MB | ~15 MB | ~40 MB | ~5 MB | ~8 MB |

**Bottom line:** If you use Mac, Paste is great — but it's $29.99/year and Mac-only. If you use anything else, or want something free and open-source that works everywhere, ClipLite is the answer.

---

## ✨ What It Can Do

| Feature | What it means |
|---|---|
| **Clipboard history** | Saves the last 500 things you copy. Never lose anything. |
| **Global shortcut** | Press `Ctrl+Shift+V` from any app to open ClipLite. |
| **Instant search** | Type to find anything in your history. |
| **Pin clips** | Keep important things forever — they won't be auto-deleted. |
| **Keyboard navigation** | Arrow keys, Enter, Delete — no mouse needed. |
| **Dark mode** | Looks great in light or dark. Follows your system setting. |
| **Clear all** | One click to wipe history (keeps pinned clips). |
| **Toast notifications** | Visual feedback when you pin, unpin, or clear. |
| **100% local** | Everything stays on your computer. No accounts, no cloud, no spying. |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl + Shift + V` | Open / close ClipLite from anywhere |
| `↑` `↓` | Move through clips |
| `Enter` | Paste the highlighted clip |
| `Delete` / `Backspace` | Delete the highlighted clip |
| `Esc` | Close ClipLite |
| Type letters | Search your history |

> **Pro tip:** Just start typing when ClipLite opens. It automatically focuses the search bar.

---

## 📦 Getting Started

### 🍎 macOS

```bash
# 1. Install prerequisites (one-time)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
brew install node

# 2. Clone and run
git clone https://github.com/codedbytahir/cliplite.git
cd cliplite
npm install
npm run tauri dev
```

### 🪟 Windows

```bash
# 1. Install prerequisites
#   - Download & install Rust: https://rustup.rs
#   - Download & install Node.js: https://nodejs.org (LTS version)
#   - Download & install Visual Studio C++ Build Tools:
#     https://visualstudio.microsoft.com/visual-cpp-build-tools/
#     (Check "Desktop development with C++" during setup)

# 2. Clone and run (in PowerShell or Command Prompt)
git clone https://github.com/codedbytahir/cliplite.git
cd cliplite
npm install
npm run tauri dev
```

### 🐧 Linux (Ubuntu/Debian)

```bash
# 1. Install prerequisites
sudo apt update
sudo apt install -y curl build-essential libwebkit2gtk-4.1-dev \
  libxdo-dev libappindicator3-dev librsvg2-dev

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Clone and run
git clone https://github.com/codedbytahir/cliplite.git
cd cliplite
npm install
npm run tauri dev
```

### 📋 What Happens Next

1. ClipLite appears in your system tray (the little icons near the clock).
2. It immediately starts saving everything you copy.
3. Press `Ctrl+Shift+V` anytime to see your history.
4. Click any clip or press Enter to paste it.

---

## 🧱 Project Structure

```
cliplite/
│
├── src/                          ← React frontend (the UI)
│   ├── components/
│   │   ├── ClipItem.tsx          ← Single clip row
│   │   ├── ClipList.tsx          ← The scrollable list
│   │   ├── SearchBar.tsx         ← Search input
│   │   └── Toast.tsx             ← Notification popup
│   ├── App.tsx                   ← Main app logic
│   ├── main.tsx                  ← Entry point
│   ├── types.ts                  ← TypeScript types
│   └── index.css                 ← Design tokens & styles
│
├── src-tauri/                    ← Rust backend (the engine)
│   ├── src/
│   │   ├── lib.rs                ← Tauri commands & setup
│   │   ├── main.rs               ← Binary entry point
│   │   ├── db.rs                 ← SQLite database
│   │   └── clipboard.rs          ← OS clipboard monitor
│   ├── Cargo.toml                ← Rust dependencies
│   ├── tauri.conf.json           ← App configuration
│   ├── capabilities/default.json ← Permissions
│   └── icons/icon.png            ← App icon
│
├── package.json                  ← npm dependencies
├── tailwind.config.js            ← Tailwind CSS config
├── vite.config.ts                ← Build config
└── LICENSE                       ← Apache 2.0
```

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Desktop shell** | [Tauri v2](https://v2.tauri.app) | Native, tiny (~10 MB), cross-platform |
| **UI** | React 18 + TypeScript + [TailwindCSS](https://tailwindcss.com) | Fast, type-safe, utility-first CSS |
| **Backend** | Rust | Memory-safe, zero-cost abstractions |
| **Database** | SQLite (bundled via `rusqlite`) | Zero config, reliable, 500-clip rolling storage |
| **Clipboard** | [`arboard`](https://crates.io/crates/arboard) | Cross-platform clipboard access |
| **Hotkeys** | Tauri global shortcut plugin | System-wide keyboard shortcuts |
| **Design** | Custom CSS tokens + [skills.sh](https://skills.sh) standards | Consistent, accessible, intentional |

---

## 🎨 Design Philosophy

ClipLite follows three design skill standards from [skills.sh](https://skills.sh):

| Skill | Source | How it's applied |
|---|---|---|
| **frontend-design** | [Anthropic](https://www.skills.sh/anthropics/skills/frontend-design) | Custom token system, "bookmark spine" signature element, restrained palette |
| **web-design-guidelines** | [Vercel](https://www.skills.sh/vercel-labs/agent-skills/web-design-guidelines) | Full ARIA accessibility, keyboard handlers, focus management |
| **emil-design-eng** | [Emil Kowalski](https://www.skills.sh/emilkowalski/skill/emil-design-eng) | No animation on frequent actions, active press feedback, reduced-motion support |

**Key design decisions:**
- `Ctrl+Shift+V` has **zero animation** — used 100+ times/day
- Only `transform` + `opacity` animated (GPU-composited, never lags)
- Bookmark spine is the **only decorative element** — everything else is disciplined
- Custom easing: `cubic-bezier(0.23, 1, 0.32, 1)` for responsive feel

---

## ♿ Accessibility

| Standard | Implementation |
|---|---|
| ARIA roles | `role="application"`, `role="listbox"`, `role="option"`, `aria-label` on all buttons |
| Keyboard nav | Full arrow-key, Enter, Delete, Escape support |
| Focus rings | Custom `:focus-visible` with indigo ring, high contrast |
| Screen reader | All interactive elements labeled, `aria-live="polite"` for toasts |
| Reduced motion | `prefers-reduced-motion` respected, all animations disabled when set |
| Color scheme | `color-scheme: light/dark` on `:root` — scrollbars and inputs match theme |

---

## 🤝 Contributing

ClipLite is built and maintained through **AI-assisted development**. Here's how to contribute:

1. **Report bugs** → [Open an issue](https://github.com/codedbytahir/cliplite/issues)
2. **Suggest features** → [Start a discussion](https://github.com/codedbytahir/cliplite/issues)
3. **Submit code** → Fork, branch, PR. Keep it simple.
4. **Improve docs** → The README, landing page, and inline comments are all fair game.

All contributors must follow the [Apache 2.0 License](LICENSE) terms.

---

## 📜 License

[Apache 2.0](LICENSE) — free for personal use, commercial use, modification, and distribution. See the license file for full terms.

---

## 🌐 Links

- **Landing page:** [codedbytahir.github.io/cliplite](https://codedbytahir.github.io/cliplite/)
- **GitHub repo:** [github.com/codedbytahir/cliplite](https://github.com/codedbytahir/cliplite)
- **Issues:** [github.com/codedbytahir/cliplite/issues](https://github.com/codedbytahir/cliplite/issues)

---

<p align="center">
  <sub>Built by AI · Informed by <a href="https://skills.sh">skills.sh</a> · Licensed Apache 2.0</sub>
</p>
