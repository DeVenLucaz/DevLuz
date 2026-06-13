# DevLuz
### The source of light. Feed this to Antigravity before anything else.

---

## Who is DeVen?

**Name:** DeVenLucaz
**Age:** 22–25
**Location:** Pune, India
**GitHub:** github.com/DeVenLucaz
**Contact:** GitHub only — no email, no socials on the site

DeVen is a **vibe-coder**. Not a developer in any traditional sense — no CS degree, no PC, no IDE, no desk setup. Builds everything on an Android phone using Termux. Has been writing fiction for 9+ years. Has been building software for about 6 months. In those 6 months: shipped a local LLM runner for Android, a floating AI companion with a spiking neural network brain, a minesweeper survival game, a natural language Termux interface, an on-device LLM Android app, an AI-powered fact-checking platform, and a bilingual surrealist novel with its own LLM training dataset.

**The one sentence:** *"I build things that may not be available to most — built exactly to my own convenience and specifications."*

**Identity:**
- Indie dev — solo, self-taught, no rules
- Creative technologist — code and art carry equal weight
- Builder — ships fast, iterates, breaks things
- Vibe-coder — the vibe comes first, the architecture follows (but the architecture is actually good)

---

## The Termux-Only Constraint — Make This Loud

DeVen builds **everything** on an Android phone using Termux. No laptop. No desktop. No 32GB RAM machine with three monitors. The phone is the dev environment, the test device, and the deployment pipeline simultaneously.

This is **both a philosophy and a rebellion:**
- Constraints breed creativity — limitations force sharper thinking
- A direct rebellion against "you need a proper setup to build real things"
- CI/CD via GitHub Actions. AI agents (Antigravity CLI) handle implementation. Claude handles architecture and planning.
- Stack: Kotlin, React/Vite, Python — all written, tested, and shipped from one phone

This is the most distinctive thing about DeVen. Frame it as a superpower, not a handicap.

---

## Tech Stack

- **Kotlin / Android** — native apps (DosCom, Lok.AI)
- **JavaScript / React + Vite** — games and web tools (MinePath, FactRadar frontend)
- **Python** — CLI tools and AI pipelines (llamdrop, Vernux)
- **Node.js / Express** — backends (FactRadar server)
- **Termux / Bash** — the entire dev environment
- **GitHub Actions** — CI/CD for all projects
- **AI-assisted workflow** — Antigravity CLI for implementation, Claude for architecture

---

## Projects — All Seven, Real Descriptions

---

### 1. DosCom
**Status:** v2.4.5 — Active development
**Repo:** github.com/DeVenLucaz/DosCom
**Live:** Install via Obtainium from the repo

**What it actually is:**
DosCom is not an assistant. Not a widget. Not a chatbot with a face. It is a creature — a floating Android companion called Astro-ink-drop that lives on your screen as an overlay. It has its own inner life.

The creature moves using a mime movement system — it selects a style based on distance, direction, mood, and time of day. Walk, slide, staircase, skateboard, tightrope, balloon, rocket, moonwalk. There is a 1% random moonwalk chance regardless of all other conditions. It climbs screen edges, slips occasionally (15% chance per 5 cycles), and sometimes stops mid-climb to decide whether to continue or slide back down.

When nothing is happening it entertains itself — subtle body bob, blinking, antenna glow pulse, random sub-animations: stretches, sneezes, hiccups, yawns, coin flips, phone checks. When truly bored it opens a toy box and pulls out a fishing rod, magnifying glass, treasure map, sword, binoculars, or book — each with a full animation sequence. The book can put it to sleep.

It reacts to the phone: sprints to charge when charging starts, collapses on low battery, pulls out a boombox when headphones connect, photobombs screenshots, peeks over the keyboard edge, tiptoes in silent mode, puts on a pilot hat in airplane mode, grabs the nearest edge and glares when you shake the phone, bounces in rhythm when walking is detected.

It has a brain. Every install has a unique Spiking Neural Network (Leaky Integrate-and-Fire, pure Kotlin) that makes behavioral decisions — which toy to pick, which mime style to use, how often to trigger discoveries. The brain learns from your reactions via STDP-lite reinforcement and saves its weights. No two DosComs behave identically over time.

It has an emotional memory — a persistent sentiment score that makes it more confident and energetic with positive reactions, quieter and more withdrawn with negative ones. Toddlers forgive fast.

Three consciousness modes, switched by double-tap:
- **ALIVE** — overlay only, no API, no permissions beyond draw-over-apps. Antenna glows white.
- **AWAKE** — adds Gemini API. The creature can speak, rarely, in toddler language. Antenna glows blue.
- **AWARE** — adds Accessibility permission. The creature notices what app is open, reacts to what's on screen. Antenna glows green.

Drawn entirely in code using Android Canvas. No image assets. No spritesheets. Every pixel rendered live every frame. Pinch to resize.

**Why it matters:** Every install has a different brain. It's genuinely alive in a weird small way.

**Mascot role — MOST IMPORTANT ELEMENT ON THE SITE:**

A reference image is at `sources/astro-inkdrop-reference.png`. Four angles of the character. Study it before writing any code.

Visual anatomy from the reference:
- Body: deep navy-black, glossy/ceramic surface with subtle specular highlights
- Head: teardrop/ink-drop shape — wider at the base, tapering to a soft point at the top
- Eyes: two large glowing cyan circles, bioluminescent, no pupils
- Mouth: tiny cyan horizontal dash
- Chest/belly: spiral galaxy texture embedded into the body — deep space swirl visible through the surface
- Limbs: short, rounded, stubby arms and two small feet
- Proportions: chibi — roughly 3:2 head-to-body ratio

**Implementation:** Build Astro-ink-drop as a **Three.js 3D character** — not Canvas 2D, not SVG. Model it procedurally using Three.js geometries (SphereGeometry, CapsuleGeometry, merged shapes). Apply a dark glossy MeshPhysicalMaterial with a galaxy texture on the torso. Cyan emissive MeshBasicMaterial for the eyes and mouth dash. The character lives in its own small Three.js renderer overlaid on the page — transparent background, fixed position, pointer-events passthrough everywhere except the character itself.

**Behavior — mirrors what DosCom actually does on a phone:**
- Floats and idles at all times — gentle breathing animation (subtle scale pulse on body), occasional eye blink, slow body bob
- Wanders slowly across the viewport — not random drift, purposeful-looking movement like it's exploring the screen
- Reacts to cursor proximity — turns to face the cursor when it gets close, eyes track it, leans slightly toward it
- Interrupts the viewer mid-scroll — occasionally stops in a prominent position and does something: stretches, looks directly at camera, waves a stubby arm, then wanders away
- Reacts to viewer idle — if no mouse/scroll movement for 30+ seconds, Astro-ink-drop notices, wanders closer, peeks as if checking if anyone is there
- Reacts to section changes — when the viewer scrolls into a new section, it reacts subtly: looks toward the new content, bounces once
- On the DAAYAN page specifically: behavior shifts — slower, more contemplative, less erratic movement
- Click/tap on the character: surprise animation, stumbles backward, recovers, glares slightly, then resumes

This is not a decoration. It is a creature that lives on the screen and occasionally notices you exist. Not a helper. Not a guide. Just present, doing its own thing, sometimes interrupting.

---

### 2. llamdrop
**Status:** v0.9.5 — Testing phase, works reliably especially in Termux
**Repo:** github.com/DeVenLucaz/llamdrop

**What it actually is:**
llamdrop is a free, open-source Python CLI/TUI that lets anyone run a local AI model on whatever device they own — Android phone via Termux, old laptop, Raspberry Pi, budget PC, even a gaming console running Linux. One curl command installs everything. Two commands to run.

The hard part it solves: local AI setup is full of invisible friction. Wrong model for your RAM. Wrong quantization. Backend that crashes on your GPU. llamdrop eliminates all of it by profiling your actual hardware — RAM, CPU architecture (big.LITTLE aware), CPU instruction flags (AVX2/AVX512/NEON), GPU vendor, Android SoC — and auto-selecting the correct backend and model variant for your exact machine.

7-tier device classification (Micro to Workstation). 41 verified models in the catalog, filtered to only show what will actually run. Smart quantization picks the best Q4/Q2/Q5/IQ variant based on live RAM at download time. On Android specifically: never forces GPU (Mali Vulkan is slower than CPU; Adreno crashes). CPU-only. No guessing.

Resilient downloader with HTTP resume and SHA-256 verification. Context trimming prevents out-of-memory crashes mid-conversation. Prompt format auto-detection per model family (ChatML, Llama3, Gemma, Phi3). Live RAM monitor with color-coded bar. Battery monitoring during inference. Multi-language UI (English, Hindi, Spanish, Portuguese, Arabic). Self-update via `llamdrop update`. Health checker via `llamdrop doctor`.

GPL v3 — cannot be sold, cannot be paywalled. Written into the license permanently.

Born from a real experience: one vibe-coder spent hours trying to run local AI on an Oppo F19 Pro+ with no PC and no budget. Dozens of crashes. Models that were incompatible. RAM errors with no explanation. llamdrop is the tool that should have existed already.

**Why it matters:** Most people on budget hardware keep getting left out of local AI. llamdrop is specifically for them.

---

### 3. MinePath
**Status:** V4 — The Sanctuary Update (current and playable)
**Repo:** github.com/DeVenLucaz/minepath
**Live:** DeVenLucaz.github.io/minepath

**What it actually is:**
One chicken. One minefield. No second chances.

MinePath is a browser-based minesweeper survival game built with React + Vite + Capacitor (also ships as an Android APK). Step on a mine — instant game over. No hearts. No retries. No cushion.

V4 added a full living world around the minesweeper core: a **Sanctuary hub** you build and grow over time (Seed Silo for passive income, Training Nest for XP boosts, Playground), a **Hatchery** with egg drop system and three rarity tiers (Brown/Blue/Golden), **Player XP and leveling** with Feather Points currency, a **21-skill Skill Tree** across four paths (Scout, Tank, Merchant, and Skin-exclusive skills), and **Endless Mode** — an auto-scrolling tile runner across 5 themed worlds (Classic, Lava, Ice, Jungle, Galaxy) where difficulty and scroll speed ramp continuously.

The grid scales from 6×6 to 10×9 as levels increase. Mine density goes from 20% at level 1 to 60% at level 20+. The timer doesn't just get shorter — it actually speeds up. 5 chicken skins (Classic, Space, Ninja, Royal, Ghost), each with 3 exclusive skill tree unlocks. 5 pets with unique passive abilities. Daily Challenge: one seeded level per day, one attempt.

Built entirely on a phone using React. Packaged as an APK via Capacitor. CI/CD via GitHub Actions.

**Why it matters:** A minesweeper game with a skill tree, an egg hatchery, and a passive income farm. Built on a phone.

---

### 4. FactRadar
**Status:** Live but partially unstable — intentionally running on free API tiers only
**Live:** factradar.onrender.com
**No repo link — deployed site only**

**What it actually is:**
FactRadar is an AI-powered fact-checking platform. Paste a claim, drop a URL, or upload a screenshot — it returns a verdict (TRUE / FALSE / PARTIAL / UNVERIFIED / DISPUTED), a credibility score (0–100), a journalistic analysis paragraph, bias rating, and three verified sources.

The hard engineering problem is getting results that are actually trustworthy, not just fast. Here's how it works:

**Evidence pipeline first, AI last.** Before any AI is called, FactRadar gathers real-world evidence in parallel: NewsAPI for recent articles, Google News RSS (free, no key needed), Wikipedia API for background context. The claim is never sent to an AI cold — only claims with sufficient evidence (>50 characters of assembled context) get AI analysis. Claims with no evidence automatically return UNVERIFIED. The AI is grounding its verdict in actual current news, not just its training data.

**Cross-verification for disputed facts.** For claims with evidence, FactRadar calls Gemini and Groq independently and simultaneously. If they agree — verdict stands. If they disagree — the result is marked DISPUTED and both models' reasoning is shown. Two independent AI systems disagreeing is itself useful information.

**Similarity cache.** Claims within 75% string similarity of something checked in the last 7 days return the cached result instantly — consistent verdicts for similar phrasing without re-burning API quota.

**Red flag detection independent of AI.** Suspicious domain extensions, no author bylines, excessive ALL CAPS, sensational language — flagged before any AI is involved.

**Confidence sub-scoring.** Source reliability, claim specificity, and corroboration all scored independently and combined into a confidence level (LOW / MEDIUM / HIGH).

**Why it's unstable:** Entirely intentional. The project runs on free tiers of Gemini, Groq, and OpenRouter with a fallback chain — if one is rate-limited, it tries the next. The instability is the cost of keeping it free. This was the first project where DeVen started vibe-coding.

**Input types:** Plain text claims, URLs (article content scraped with Cheerio), image uploads (screenshots analyzed by Gemini's vision).

**Tech:** Node.js + Express backend, vanilla JS frontend, SQLite via better-sqlite3, deployed on Render free tier.

---

### 5. Lok.AI
**Status:** No release version yet — fully built, pre-release
**Repo:** github.com/DeVenLucaz/Lok.AI

**What it actually is:**
Lok.AI is llamdrop's Android sibling — where llamdrop is a Termux CLI tool, Lok.AI is a proper Android app with a full Jetpack Compose UI. Same mission: run local AI on your phone with no cloud, no account, no subscription.

It bridges the gap via NDK: llama.cpp is compiled as a C++ library and called from Kotlin through a JNI bridge. The inference engine lives in native code; everything else is modern Android.

First launch scans hardware (RAM, CPU, GPU, swap via /proc and Android APIs) and classifies the device into one of 7 tiers (Micro to Workstation). The model catalog (41 verified models) is then filtered to only show what will actually run. Models download in the background with HTTP resume and SHA-256 verification.

Three inference modes: Normal (temperature 0.7), Precise (activates built-in `<think>` tokens for reasoning models, temperature 0.4), and Focused (injects step-by-step system prompt, temperature 0.4). Every response shows a Thinking Panel with retrieval steps, tokens used, and inference time.

Named Agents: save a file + a context strategy (Code = full load every message, Story = skeleton + retrieval, Research = summary + retrieval, Reference = pure TF-IDF retrieval). TF-IDF runs fully on-device — no embedding model, no server. If the model says "I'm not sure," the app silently searches deeper and re-runs.

All sessions saved in Room DB — searchable, resumable, exportable as markdown. No accounts. No telemetry. No ads.

**Why it matters:** llamdrop made local AI accessible via Termux. Lok.AI makes it accessible for everyone with an Android phone who doesn't want a terminal.

---

### 6. Vernux
**Status:** v0.8.0 — Research/prototype phase. Functional, installable, not formally released.
**Repo:** github.com/DeVenLucaz/Vernux

**What it actually is:**
Vernux is a natural language interface for Termux. Instead of memorizing bash commands, you describe what you want in plain English — Vernux figures out the command, checks if it's safe, warns about risks, and runs it.

The intelligence is layered: first a curated dictionary of 60+ Termux-specific entries, then an offline library of 710+ commands built from Linux Command Library, tldr-pages, and NL2Bash corpus patterns, then AI fallback (local model via llamdrop or API). Most things are resolved offline without touching any AI.

Package intelligence silently corrects wrong names before installing — `install python` becomes `pkg install python3`, `install gcc` becomes `pkg install clang` (Termux uses clang, not gcc), `install youtube-dl` becomes `pkg install yt-dlp` (youtube-dl is abandoned). On low-RAM devices it warns before heavy packages and suggests lighter alternatives.

**Reality Bridge** is its most distinctive feature — a knowledge layer for the non-obvious things that break Termux beginners. The gap between "what Linux docs say" and "what actually happens on Android." Brand-specific notes for Xiaomi/MIUI, OPPO/ColorOS, Samsung, Vivo, Realme.

Safety classification on every command before it runs: Safe (auto-runs), Caution (warns + confirms), Danger (big warning + explains consequences), No-undo (hard stop — must type "yes" explicitly). Protected paths never auto-run with dangerous commands. Fork bombs blocked regardless of mode.

10 built-in Recipes: multi-step guided workflows for common tasks (push project to GitHub, set up Python dev environment, download YouTube video, make Termux look good). If a recipe step fails mid-way, Vernux shows exactly what completed and what didn't.

Three user modes: Noob (no raw commands ever shown), Learner (commands shown + explained), Pro (fast and minimal).

**Why it matters:** Bridges the gap between "I want to do X in Termux" and "I need to know 4 bash flags and the right package name to do X."

---

### 7. DAAYAN बंधन
**Status:** Complete. Two versions exist.
**No GitHub repo. No link. Just the book.**

**What it actually is:**
A bilingual surrealist novel written in both Hindi and English — not translated from one to the other, but genuinely bilingual in structure and voice. DeVen also trained an LLM on it: 377-entry ChatML/JSONL dataset across 12 thematic files.

**Two versions:**
- **Realistic version** — grounded in the real world even as it bends it. The surrealism exists within human experience.
- **Myth version** — the core version. Operates in a mythological space. The rules of reality are different here.

**Critical instruction for Antigravity:** Both versions of the book source text will be in the `sources/daayan/` folder. Read them. Let the content of each version determine its own visual world — its palette, its typography weight, its texture, its motion. Do not pre-decide what they look like. Extract it from the text itself.

**DAAYAN page design rules:**
- A dedicated page, accessible from the main site
- Opens like an actual physical book — page-turn aesthetic, chapter navigation
- One toggle switches between Realistic and Myth versions — not just swapping text but transforming the entire visual theme of the page to match that version's world
- The only place on the site where the copy goes fully literary
- Noto Serif Devanagari for Hindi script sections
- This page should feel like leaving the portfolio site and entering somewhere else entirely

---

## Aesthetic Direction

**One line:** Dark cosmic surrealism meets brutalist grid meets cyberpunk grit — with ink as the unifying material across everything.

**Palette (starting point — push further based on the content):**
- Background: near-black with deep indigo undertone (`#08080f`)
- Primary: electric violet / plasma purple (colder than `#7c3aed`)
- Accent: bioluminescent cyan (sharp, not soft — `#00e5ff` range)
- Danger accent: deep crimson (`#ff1744` — sparingly)
- Text: cold off-white (`#e8e8f0`)
- DAAYAN: let the book decide

**Typography:**
- Display: not Space Grotesk. Consider Syne, Bebas Neue, Clash Display — something with character
- Body: Inter or DM Sa
