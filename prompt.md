# Antigravity — Build Instructions
### Read DevLuz.md fully before writing a single line of code.

---

## Your Task

Build the personal profile website for DeVenLucaz.

The source material is everything in the `sources/` folder:
- `DevLuz.md` — the full identity brief, every project described accurately, all design direction
- `DosCom.md`, `llamdrop.md`, `minepath.md`, `Lok_AI.md`, `Vernux.md` — official READMEs for reference
- `daayan/daayan-realistic.md` — full text of DAAYAN बंधन, Realistic version
- `daayan/daayan-myth.md` — full text of DAAYAN बंधन, Myth version

---

## Non-negotiables

**Astro-ink-drop lives on the site. This is the single most important element — prioritize it above everything else.**

Build it as a Three.js 3D character modeled procedurally from `sources/astro-inkdrop-reference.png`. Study the reference image: teardrop head, glossy deep navy body, two large glowing cyan eyes, tiny cyan dash mouth, spiral galaxy texture on the chest, stubby chibi limbs. Its own Three.js renderer overlaid on the full site with a transparent background. Pointer-events passthrough except on the character itself.

It wanders the viewport like it owns it. Turns to face the cursor when close. Eyes track movement. Breathes, blinks, bobs. Interrupts the viewer mid-scroll occasionally — stretches, waves, looks directly at camera, moves on. Notices when the viewer goes idle. Reacts to section changes. Stumbles and glares when clicked. On the DAAYAN page, becomes slower and more contemplative.

This is not a mascot sitting in a corner. It is a creature doing its own thing on your screen. Exactly like DosCom does on a phone — but for the web.

**Three.js / WebGL hero.** Full 3D background on the landing section. Earn it.

**DAAYAN gets a dedicated page.** Not a section — a separate page. Opens like a physical book. Chapter navigation. One toggle switches between Realistic and Myth versions. When you toggle, the entire visual theme of the page transforms — palette, typography weight, texture, motion — derived from reading the actual book content of each version. Don't pre-decide the themes. Extract them from the text.

**Seven projects, all real.** DosCom, llamdrop, MinePath, FactRadar, Lok.AI, Vernux, DAAYAN. Each described accurately using the DevLuz.md descriptions. No invented features. No filler copy. FactRadar links to factradar.onrender.com only — no repo link.

**No:** skill bars, fake testimonials, "Let's work together!" CTAs, generic developer copy, percentage-based skill wheels.

**One contact link:** github.com/DeVenLucaz — nothing else.

---

## You Decide

- Site structure (single-page vs multi-page — make the right call for the content)
- Exact palette (DevLuz.md gives starting points, push them further)
- Typography choices (within the guidance given)
- How each project card/section is presented — they're not all the same, they shouldn't look the same
- Animation specifics
- Layout and grid

---

## Quality Standard

Not the most technically complex portfolio ever built by an AI. The most *true* one. Every visual decision traceable back to who DeVen actually is. The Termux-only workflow as a superpower. The creature as a mascot. The novel as equal weight to the code. The instability of FactRadar stated plainly, not hidden.

Be creative. Be accurate. Ship it.
