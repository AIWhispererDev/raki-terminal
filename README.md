# Raki Terminal

A cyberpunk-themed personal portfolio built as an interactive memory dump terminal. The UI mimics a crashed system's hex dump, with hidden navigation, glitch effects, and a particle logo rendered in WebGL.

## Features

- Animated particle logo using Three.js / React Three Fiber — reacts to mouse cursor
- Hex dump memory grid with a hidden "RAKI" pattern encoded in red-highlighted cells
- Spooky consciousness messages that randomly inject into the grid
- Interactive terminal with commands (`help`, `projects`, `whoami`, `open`, `play`, `clear`, etc.)
- Binary decoder easter egg — type a binary string into the terminal to decode it
- Secret keycode easter egg (`p` `l` `a` `y`) that triggers a Fallout-style terminal hacking minigame
- Decryption modals for project and about sections with typewriter text effect
- Web Audio API sound effects on hover, click, and typing
- Fully responsive (mobile + desktop)

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Three.js + `@react-three/fiber`
- Framer Motion (`motion`)
- Web Audio API (no library)

## Getting Started

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Terminal Commands

| Command | Description |
|---|---|
| `help` | List available commands |
| `whoami` | Open identity/about modal |
| `projects` | List all projects |
| `open <name>` | Open a project or about modal |
| `play` / `hack` | Trigger the hacking minigame |
| `ls` / `dir` | Fake filesystem listing |
| `clear` | Clear terminal history |
| `sudo ...` | You know what happens |

Type any binary string (e.g. `01110010 01100001 01101011 01101001`) to decode it.

## Easter Eggs

- Type `p` `l` `a` `y` anywhere on the main page to launch the terminal hacking minigame
- Hover over hex cells to trigger a glitch animation
- Watch the grid — the system is watching back
