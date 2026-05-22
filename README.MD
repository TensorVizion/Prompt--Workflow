Prompt → Workflow Builder
=========================

> A browser-only tool for Stable Diffusion creators. Turn a single text prompt into a fully-configured generation recipe — complete with model recommendations, LoRA selections, sampler settings, and resolution — with zero setup and no backend.

* * *

What It Does
------------

**Prompt → Workflow Builder** solves a real friction point in AI image generation: translating a creative idea into a technically correct set of generation parameters. Instead of manually dialing in steps, CFG, aspect ratios, and LoRA combinations every time, you describe what you want and the tool builds the recipe for you.

It has three integrated modules that work together:

### Recipe Generator

Paste your prompt, choose a mode and style, adjust quality and creativity sliders — and generate a complete Stable Diffusion workflow as a structured JSON file. The recipe includes:

* Recommended base model + family (SDXL, SD 1.5, etc.)
* Auto-selected LoRAs with weighted strengths
* Positive and negative prompt construction
* Sampler, steps, and CFG scale derived from your quality/consistency inputs
* Resolution mapped from aspect ratio to SD-compatible pixel values
* Seed + seed variants for batch runs
* img2img / inpaint denoise values when applicable
* Human-readable checklist with targeted troubleshooting tips (hands, rain, product shots, etc.)

### Prompt Randomizer

Use your current prompt as an anchor and generate styled variations using a weighted component database. Adjust a temperature slider to control how far variations drift from the original. Components span styles, subjects, lighting, environments, camera angles, and post-processing effects — each weighted to match the detected style context of your prompt (cinematic, photoreal, anime, product, cyberpunk, etc.).

### Prompt Organizer

A persistent local library (stored in `localStorage`) for saving, searching, tagging, and reloading prompts. Supports tag-based filtering, bulk delete, and one-click loading back into the main input.

* * *

Features
--------

* **Zero dependencies** — pure HTML + CSS + vanilla JS, no build step, no npm, no server
* **Runs entirely in the browser** — open `index.html` and it works
* **Auto style detection** — keyword analysis routes your prompt to the correct model, LoRA set, and negative prompt automatically
* **Batch recipe export** — generate a recipe for every variation at once and download a single `recipes.json`
* **Aspect-ratio-to-resolution mapping** — automatically picks SD-aligned pixel dimensions (multiples of 64)
* **Consistency ↔ creativity slider** — maps to CFG scale and img2img denoise in a single control
* **Extensible content databases** — models, LoRAs, prompt components, and keywords all live in flat JS files you can edit directly

* * *

File Structure
--------------

    Prompt To Workflow/
    ├── index.html           # Layout and UI
    ├── styles.css           # All styling
    ├── app.js               # UI wiring, event handlers, organizer logic
    ├── recipes.js           # Core recipe engine (style detection, model/LoRA selection, parameter math)
    ├── promptRandomizer.js  # Variation generator with weighted component picking
    ├── contentdb.js         # Model catalog, LoRA catalog, style keywords
    └── promptdb.js          # Prompt component database (styles, subjects, lighting, camera, effects)

* * *

Getting Started
---------------

No installation required.

1. Clone or download the repository

2. Open `index.html` in any modern browser

3. Type a prompt and click **Generate Recipe**
    git clone https://github.com/your-username/prompt-to-workflow.git
    cd prompt-to-workflow
    open index.html  # macOS
   
   # or just drag index.html into your browser

* * *

How to Use
----------

### Basic Recipe Generation

1. Enter your prompt in the **Prompt** field
2. Select a **Mode** — `Text2Img`, `Img2Img`, or `Inpaint`
3. Optionally choose a **Style preset** (or leave on Auto-detect)
4. Set **Aspect ratio** and adjust the **Quality** and **Consistency** sliders
5. Set how many **Variants** (seed variations) you want
6. Click **Generate Recipe**

The JSON recipe appears on the right. Use **Copy** to paste it into your workflow, or **Download JSON** to save the file.

### Prompt Randomizer

1. Enter a base prompt (the "anchor") — this is what variations are built from
2. Set a **Creativity (temperature)** level — lower keeps variations close to the anchor, higher drifts further
3. Optionally add comma-separated **tags** to label saved prompts
4. Click **Generate Variations**

From there you can:

* **Save All to Organizer** — store every variation in your local library
* **Save Anchor Prompt** — save just the original prompt
* **Batch: Recipe for Each Variation** — generate a full recipe for every variation at once, then **Download recipes.json**

### Prompt Organizer

All saved prompts appear in the right-side organizer panel. You can:

* **Search** by prompt text or name
* **Filter by tag** to narrow results
* **Load** any saved prompt back into the main input
* **Delete** individual entries or delete all filtered results at once
* **Clear All** to reset the library

* * *

Customizing the Databases
-------------------------

The tool is designed to be extended. All content lives in two plain JS files.

### `contentdb.js` — Models, LoRAs, and Style Keywords

Add real model names from Civitai, TensorArt, or your local setup:
    const MODELS = [
      { name: "Juggernaut XL v9", family: "sdxl", tags: ["photoreal", "cinematic", "portrait"] },
      // ...
    ];

    const LORAS = [
      { name: "MJ Style v2", tags: ["cinematic", "dramatic"], strength: [0.3, 0.7] },
      // ...
    ];

### `promptdb.js` — Prompt Components

Add new component entries to any category. Each entry has a `text` field and a `weight` map:
    PROMPT_COMPONENTS.lighting.push({
      text: "bioluminescent glow, deep ocean tones",
      weight: { base: 1.0, cinematic: 1.2 }
    });

Weight keys match the style keywords defined in `KEYWORD_KEYS` inside `promptdb.js`.

* * *

Supported Style Contexts
------------------------

| Style       | Triggers                                                                |
| ----------- | ----------------------------------------------------------------------- |
| `cinematic` | cinematic, dramatic lighting, rim light, golden hour, volumetric, moody |
| `photoreal` | photoreal, realistic, DSLR, 35mm, bokeh, film                           |
| `anime`     | anime, manga, cel shading, lineart, gacha                               |
| `product`   | product, packshot, studio lighting, ecommerce, macro                    |
| `cyberpunk` | cyberpunk, neon, chrome, hologram                                       |

* * *

Recipe Output Format
--------------------

    {
      "meta": {
        "generatedAt": "2026-05-21T...",
        "mode": "txt2img",
        "style": "cinematic",
        "aspect": "16:9",
        "variants": 6,
        "notes": "Balanced drift."
      },
      "model": {
        "base": "Realistic Vision-style",
        "family": "sd1.5"
      },
      "loras": [
        { "name": "Cinematic Lighting", "strength": 0.5 }
      ],
      "prompts": {
        "positive": "your prompt here",
        "negative": ["worst quality", "blurry", "..."]
      },
      "generation": {
        "sampler": "DPM++ SDE Karras",
        "steps": 35,
        "cfg": 7.6,
        "width": 1216,
        "height": 704,
        "seed": 482910234,
        "seedVariants": [482910234, 482910247, "..."],
        "img2img": { "enabled": false, "denoise": 0.52 },
        "inpaint": { "enabled": false, "denoise": 0.38 }
      },
      "recommendedWorkflow": ["..."],
      "checklist": ["..."]
    }

* * *

Browser Compatibility
---------------------

Works in any modern browser with ES6+ support. No polyfills required.

* Chrome / Edge 90+
* Firefox 88+
* Safari 14+

Prompt organizer data is saved in `localStorage` and persists across sessions in the same browser.

* * *

Roadmap
-------

* [ ] Import/export organizer library as JSON
* [ ] User-defined style presets saved to localStorage
* [ ] Drag-and-drop prompt reordering in the organizer
* [ ] Real Civitai API integration for model/LoRA lookup
* [ ] ComfyUI workflow JSON export format

* * *

License
-------

MIT — free to use, modify, and distribute.
