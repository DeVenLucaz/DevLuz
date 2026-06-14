# Research & Field Notes
### source file for devenlucaz.github.io/DevLuz/research.html
### Feed this to Antigravity along with DevLuz.md

---

## Page Identity

**Name:** Research & Field Notes
**URL:** research.html
**Nav label:** RESEARCH (add to nav in index.html alongside WORK / ABOUT / DAAYAN)

This page is not a blog. Not tutorials. Not documentation.
It's a record of things actually learned, built, and understood — with the real details showing, not just the headline.

Each entry has a category tag: PROJECT DEEP-DIVE / OSINT / CONSCIOUSNESS

---

## ENTRY 01 — PROJECT DEEP-DIVE
### The Spiking Neural Network Inside DosCom

**The question it answers:** How does a floating Android creature make behavioral decisions without calling an AI API?

**Background:**
DosCom needed a brain. Not a rulebook — something that could weight multiple signals simultaneously, produce different outputs with similar inputs, and change over time. The answer was a Spiking Neural Network: a Leaky Integrate-and-Fire model ported entirely to Kotlin, running on-device with no ML framework, no TensorFlow Lite, no ONNX. Just math.

**How it actually works:**

The core is `LIFCore` — 8 input neurons feeding into 48 hidden neurons. The hidden layer has recurrent connections back into itself (each of the 48 neurons can influence all others), giving the network memory within a single think cycle.

Each neuron maintains a membrane potential — a float that starts at -65 (resting) and climbs toward -50 (threshold) as current flows in:

```
dv = (vRest - membrane[j] + current) / tau
membrane[j] += dv
if membrane[j] >= vThresh → spike, reset to vRest
```

When `think()` is called, the network runs for 150 time steps. Each step, spikes propagate through input weights and recurrent weights, accumulating a spike count per neuron. After 150 steps, those counts multiply through a 48×19 decision layer to produce 19 output scores.

Those 19 scores map to 7 behavioral decisions:
- Outputs 0–5 → mime movement style (walk, slide, staircase, skateboard, balloon, rocket)
- Outputs 6–10 → idle animation
- Outputs 11–14 → toy box selection
- Outputs 15–18 → binary flags (moonwalk, discovery mode, social mode, hyperactive mode)

**The 8 inputs it reads:**
Battery level, time of day (normalized 0–1 across 24 hours), user activity level, session length, emotional sentiment score from EmotionalMemory, screen position, app category, idle duration.

**How it learns (STDP-lite):**

When the user reacts positively, `learn()` is called with a positive reward float. Learning rate scales with reward: `lr = 0.01f * reward`. For every hidden neuron that fired during the last think cycle — if an input was active when that neuron fired, the weight strengthens. Selected output weights strengthen; unselected ones weaken slightly (0.1× the learning rate). Weights save to `brain.json` in the app's private storage after each learning event. On next launch the brain loads its previous state.

**What makes each install unique:**

Weights initialize with `gaussian() * 8f` for input weights and `gaussian() * 0.5f` for recurrent weights. This seed is generated fresh on first install and not stored. Two DosComs installed on the same day make different decisions from hour one and diverge further with every interaction. There's no default behavior — only what this specific brain learned on this specific phone.

**What was surprising:**

The recurrent connections were added almost as an afterthought. The expectation was noise. Instead they add something closer to momentum — the network's previous state influences its next decision in a way that makes behavior feel like it has inertia. It doesn't just react to now. It carries something forward.

---

## ENTRY 02 — PROJECT DEEP-DIVE
### How llamdrop Knows What Your Device Can Actually Run

**The question it answers:** Why do most local AI tools crash or give wrong model recommendations, and how does llamdrop avoid it?

**The real problem:**
RAM alone is wrong. A phone with 8GB RAM but a Mali GPU should never use GPU inference. A device with LPDDR4x runs inference faster than LPDDR4 at the same capacity. The Termux environment breaks standard Linux assumptions — clang not gcc, no AVX2 on ARM, unreliable mmap on some Android kernels. llamdrop had to solve all of it.

**The 7-tier classification system:**

llamdrop reads `/proc/meminfo` directly, applying a weighted contribution from swap/zram (capped at 1.5GB, weighted 0.6× since compressed memory is slower). It classifies devices into: Micro (<2GB), Low (2–4GB), Low-Mid (4–6GB), Mid (6–12GB), High (12–24GB), Desktop (24–64GB), Workstation (64GB+). The model catalog is then filtered — if you're on Micro you never see a 7B model.

**The GPU decision:**

This is the most important call llamdrop makes, and it goes against what most guides say.

On Android, the code reads `getprop ro.hardware.egl`. If it returns `mali` → GPU disabled. Reason: "Mali Vulkan is SLOWER than CPU for LLM." If it returns `adreno` → GPU disabled. Reason: "Adreno Vulkan crashes in llama.cpp." CPU-only on all Android devices, no toggle offered, because the answer is always no.

On desktop Linux with NVIDIA (`nvidia-smi` present) → CUDA enabled. On Apple Silicon → Metal via MLX. The backend decision is architecture-aware, not just "do you have a GPU."

**big.LITTLE thread selection:**

Standard tools use all available cores. llamdrop maintains a hardcoded lookup table of 30+ chips mapping each to its big-core count. The Dimensity 800U has 2 big cores — llamdrop uses 2 threads, not 8. The Snapdragon 888 has 4 big cores — 4 threads. Unknown ARM chips get `max(1, cores // 2)` as a conservative fallback.

The measured result: performance-core-only threading gives 20–40% speed improvement with no quality loss on big.LITTLE devices.

**Other Termux-specific fixes:**
- Swap contribution discounted 0.6× (compressed memory is slower during inference)
- mmap disabled by default on Termux (unreliable on some Android kernels)
- Context window sized from effective RAM (physical + weighted zram), not total RAM
- Flash attention only enabled for CUDA/Metal, not Vulkan

**What was surprising:**

The biggest performance gains weren't from model selection or quantization. They were from thread count. The difference between "use all cores" and "use only big cores" was larger than the difference between Q4 and Q5 quantization on the same model.

---

## ENTRY 03 — PROJECT DEEP-DIVE
### FactRadar's Cross-Verification Pipeline

**The question it answers:** How do you build a fact-checker that doesn't just ask one AI "is this true?" — because that's asking for an opinion, not a verdict.

**The architecture principle:**
Evidence first. AI last. Never send a claim to an AI cold.

**The pipeline, step by step:**

**1. Cache check (first)**
Before anything else, the last 100 fact-checks from the past 7 days are loaded from SQLite. String similarity (Levenshtein-based) is calculated against the incoming claim. If any existing result scores ≥75% match, it returns immediately with the cached verdict. Same claim, same answer, no re-burning API quota.

**2. Evidence gathering (parallel)**
Three sources are queried simultaneously via `Promise.all`:
- NewsAPI — recent articles matching the claim's keywords (up to 6 words, URLs stripped)
- Google News RSS — free, no API key, catches what NewsAPI misses
- Wikipedia API — background context via key topic extraction (3-word phrases first, then 2-word, then single words)

If the assembled evidence context is under 50 characters — nothing found — the claim auto-returns UNVERIFIED without calling any AI.

**3. Red flag detection (independent of AI)**
URL checked for suspicious TLDs (.xyz, .info, .click, .buzz). Article text checked for: no author byline in first 500 characters, more than 5 ALL-CAPS words, 3+ sensational keywords (shocking, bombshell, explosive, exposed, secret, hidden truth). These flags are scored before any AI sees anything.

**4. Cross-verification (the core)**
`Promise.allSettled` calls Gemini 2.5 Flash and Groq Mixtral-8x7b simultaneously, both receiving the same claim + assembled evidence. Temperature set to 0 on both for maximum consistency. If both succeed and verdicts match → result stands. If they disagree → verdict becomes DISPUTED, both models' reasoning shown side by side, credibility score averaged. One model's opinion can be wrong. Two independent models disagreeing is itself useful information.

**5. Confidence sub-scoring**
Three independent scores (0–10 each): source reliability (news source count + Wikipedia presence), claim specificity (article content found?), corroboration (how many sources agree). Combined into LOW / MEDIUM / HIGH. Displayed alongside the verdict.

**Why it's intentionally unstable:**
FactRadar runs on free tiers of Gemini, Groq, and OpenRouter in a sequential fallback chain. When one rate-limits, it tries the next. Sometimes all three are exhausted. This is a deliberate constraint — the tool was built to cost nothing to operate. The instability is the price. A paid version would be stable. This version is free and honest about its limitations.

**Input types supported:**
Plain text claims, URLs (article scraped with Cheerio — nav/footer/ads stripped, first 4000 characters used), image uploads (screenshots analyzed by Gemini's vision API only — Groq has no vision).

---

## ENTRY 04 — PROJECT DEEP-DIVE
### MinePath's Difficulty Scaling and Grid Generation

**The question it answers:** How do you make a minesweeper game that stays dangerous at every level without becoming random?

**The core formula:**

MinePath's difficulty isn't a single slider. Five independent variables all scale with level:

```
Level 1–5:   mineRate=0.20, timerSpeed=0.8,  obstacleFreq=0
Level 6–10:  mineRate=0.30, timerSpeed=1.2,  obstacleFreq=0.3
Level 11–15: mineRate=0.40, timerSpeed=1.8,  obstacleFreq=0.5
Level 16–20: mineRate=0.50, timerSpeed=2.5,  obstacleFreq=0.7
Level 21+:   mineRate=0.60, timerSpeed=3.5,  obstacleFreq=1.0
```

Grid size also grows: `rows = min(6 + floor(level/4), 10)`, `cols = min(6 + floor(level/6), 9)`. Timer max shrinks: `max(20, 45 - level * 0.8)`. By level 20 you have a 10×9 grid, 60% mine density, a timer that starts at 29 seconds and speeds up 2.5× as it counts down, with obstacles on 70% of non-mine tiles.

**Grid generation — guaranteed safe path:**

MinePath doesn't scatter mines randomly and hope a path exists. It generates a safe path first, then mines everything else.

A biased random walk starts at bottom-left, ends at top-right. At each step, moves toward the checkpoint are added to the candidate list 3× — so the path trends toward the goal but can meander. Tiles visited by the walk are marked safe. Then mines are placed only on tiles the path never visited.

At level 8+ a "fake safe" mechanic activates: `fakeSafeCount = floor(level/8)` tiles that appear unrevealed (not visually marked as mines) are secretly mines. These are placed on safe tiles, then flipped to `isMine=true`. The player has no indicator. This is what makes high levels brutal — you can't trust your own careful play.

**Daily Challenge seeding:**

Daily challenges use a deterministic seeded random from the date string. `dateString.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCharCode(0); return a & a; }, 0)` generates a seed. All calls to `sRandom()` in daily mode use `Math.sin(seed++) * 10000 - floor(...)` instead of `Math.random()`. Same date anywhere in the world generates identical grid layout, identical mutator selection, identical difficulty offset (-5 to +20 levels from base).

**The 21-skill tree:**

Skills fall into 4 paths — Scout, Tank, Merchant, and Skin (4 skins × 3 skills each). Skin skills are locked behind owning the skin. Ghost Chicken's "Possession" (survive any death once per run with 1 second of invincibility) costs 22 Feather Points — the most expensive single skill. Scout's "Hazard Sense" (10% chance to reveal nearby mines when stepping on safe tiles) is the most strategically interesting — passive mine detection with no resource cost.

Endless Mode runs on a separate tile-runner engine: 6-wide auto-scrolling grid, scroll speed starts at 0.5 rows/second, difficulty percentage drives mine count per row, every 6 rows a floor boundary triggers. 5 themes (Classic, Lava, Ice, Jungle, Galaxy) each with unique hazard mechanics.

**What was surprising:**

The fake safe mechanic was added at level 8 as a test. It immediately made the game feel unfair — and then players started playing more carefully. The psychological effect of "any tile could be fake safe" changes the whole approach to the grid in a way that additional mines don't. Genuine uncertainty about what the safe tiles are doing is more interesting than just more mines.

---

## ENTRY 05 — OSINT
### Image Geolocation: Reading What a Photo Doesn't Say

**What this is:**
OSINT image geolocation is the practice of determining where a photograph was taken using only visual information — no metadata, no GPS EXIF data, no assistance from the person who took it.

**Current skill level:** Landmarks, shadows, architectural patterns, basic tool chain. Not advanced. Somewhere in the middle of actually understanding what I'm looking at.

**The core techniques:**

**Sun angle and shadow direction**
The sun's position tells you two things: time of day and approximate latitude. Shadows pointing roughly north → southern hemisphere. Shadows pointing roughly south → northern hemisphere. Shadow length relative to object height narrows the latitude band and season. This doesn't give a city. It eliminates most of the world immediately.

**Landmark and signage recognition**
The obvious starting point, but the skill isn't recognizing the Eiffel Tower. It's recognizing the style of a streetlight, the typeface on a road sign, the shape of a power line connector, the design of a pedestrian crossing signal. These micro-details are more useful than the main subject because they're less likely to have been staged or moved.

**Architectural and infrastructure patterns**
Flat rooflines with external water tanks suggest Mediterranean or Middle Eastern climate zones. Wooden overhead power lines suggest rural areas of specific countries. The color of visible soil suggests geological regions. Urban planning signatures — the angle of intersections, the width of sidewalks, the style of fencing — are surprisingly regional.

**Tool chain:**
Google Maps satellite and Street View for verification once a candidate location is found. Overpass Turbo (OpenStreetMap queries) for finding specific infrastructure — a particular bridge type, a specific intersection pattern — when a region is known but not a street. Reverse image search with Yandex Images (significantly better than Google for architectural matching, especially Eastern Europe and Central Asia). suncalc.org for shadow theory verification against specific dates and coordinates.

**What's genuinely hard:**
Interiors with no windows. Overcast days with no shadows. Deliberately cropped images removing all context. Photos from regions where the visual vocabulary is unfamiliar. Getting better at this means building familiarity with what "normal" looks like in regions never visited — which is its own kind of study that doesn't end.

---

## ENTRY 06 — CONSCIOUSNESS
### Lucid Dreaming: Six Months of Actually Practicing It

**What this is:**
A record of genuine practice, not a summary of what books say. Six months of consistent work with dream journaling and technique practice. Writing about it in connection with DAAYAN.

**Connection to DAAYAN:**
The myth version of DAAYAN operates in a space where the boundary between conscious intention and dream-state narrative is deliberately blurred. Practicing lucid dreaming changed how that version of the book was written. Some of the myth version's internal logic came directly from noticing how dream logic actually operates when you're aware inside it. The surrealism isn't invented — it's observed.

**The techniques practiced:**

**WILD (Wake-Initiated Lucid Dreaming)**
Entering a dream directly from waking consciousness without losing awareness. The transition involves hypnagogic imagery — visual and auditory hallucinations as the brain shifts into sleep mode. The practice is maintaining a thread of awareness through that transition without either getting pulled into unconscious sleep or staying too alert to sleep at all. Hardest technique. Success rate remains low. When it works, the dreams have a different quality — more stable, more controllable, more vivid than DILD.

**MILD (Mnemonic Induction of Lucid Dreams)**
Setting an intention before sleep: "I will recognize I'm dreaming." Combined with reality testing throughout the day — asking "am I dreaming right now?" genuinely, not as a formality. The theory is that this habit carries into dreams. It does, sometimes. Recognition usually comes from a contradiction — something that couldn't be real. The challenge is that in dreams, contradictions feel normal until you specifically look for them.

**Dream journaling**
The most important practice. Writing down dreams immediately on waking before memory degrades. After six months, patterns emerge: recurring locations, recurring figures, recurring emotional tones. These patterns become the reality checks — if the recurring location appears, recognition becomes more likely.

**What's actually been noticed:**

The transition state between waking and sleep (hypnagogia) is more accessible than expected. With practice it's possible to hold awareness there longer without falling fully asleep or snapping back. What lives in that state is strange — fragmented, non-narrative, often more interesting than what appears in full dreams.

Dream logic has its own internal consistency. Within a dream, things make sense by rules that don't exist while awake. Understanding those rules — the internal logic of a specific dream's world — is what allows navigation once lucid. Fighting the logic doesn't work. Working with it does.

The intersection with writing: fiction that operates in dream-logic space (like the myth version of DAAYAN) is more convincing when the writer has experienced dream logic from inside it. The reader feels the difference even if they can't name it.

**What's still being figured out:**
Control. Recognizing the dream state is achievable with some consistency. Directing what happens once lucid is still mostly unsuccessful — the environment tends to destabilize when deliberate intention is applied too forcefully. Still working on it.

---

## Design Notes for Antigravity

**Page aesthetic:**
Same dark cosmic palette as the rest of the site. Each entry category gets its own accent:
- PROJECT DEEP-DIVE → cyan (`#00e5ff`)
- OSINT → amber/orange (`#ff9800`)
- CONSCIOUSNESS → soft violet (`#b39ddb`)

**Entry card structure:**
- Category tag top-left (small, uppercase, colored)
- Title large
- One-line "question it answers" in italic
- First paragraph visible, rest collapsed behind an expand button
- Estimated reading time

**No dates on entries** — these aren't blog posts. They're living notes. Date implies finished. These aren't.

**Add research.html to sitemap.xml** after building.

**Nav update** — add RESEARCH to the main nav in index.html.

After building: `git add research.html index.html sitemap.xml && git commit -m "feat: research and field notes page" && git push`
