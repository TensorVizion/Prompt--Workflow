function tokenize(s){ return (s || "").toLowerCase(); }

function containsAny(text, words){
  return words.some(w => text.includes(w));
}

function detectStyle(prompt, stylePreset){
  const p = tokenize(prompt);
  if (stylePreset && stylePreset !== "auto") return stylePreset;

  if (containsAny(p, KEYWORDS.anime)) return "anime";
  if (containsAny(p, KEYWORDS.product)) return "product";
  if (containsAny(p, KEYWORDS.cinematic)) return "cinematic";
  if (containsAny(p, KEYWORDS.photoreal)) return "photoreal";
  return "cinematic";
}

function detectSubject(prompt){
  const p = tokenize(prompt);
  return {
    hands: containsAny(p, KEYWORDS.hands),
    cyberpunk: containsAny(p, KEYWORDS.cyberpunk),
    rain: containsAny(p, KEYWORDS.rain),
    character: containsAny(p, KEYWORDS.character),
    environment: containsAny(p, KEYWORDS.environment)
  };
}

function aspectToResolution(aspect){
  const mul = (n) => Math.round(n/64)*64;
  if (aspect === "1:1") return { w: mul(1024), h: mul(1024) };
  if (aspect === "4:5") return { w: mul(832), h: mul(1024) };
  if (aspect === "3:2") return { w: mul(960), h: mul(640) };
  if (aspect === "16:9") return { w: mul(1216), h: mul(704) };
  if (aspect === "9:16") return { w: mul(608), h: mul(1216) };
  return { w: mul(1024), h: mul(1024) }; // auto fallback
}

function chooseBaseModel(style){
  const scored = MODELS.map(m => {
    let score = 0;
    if (m.tags.includes(style)) score += 5;
    if (style === "photoreal" && m.tags.includes("cinematic")) score += 2;
    if (style === "anime" && m.tags.includes("illustration")) score += 2;
    return { ...m, score };
  }).sort((a,b)=>b.score-a.score);
  return scored[0] || MODELS[0];
}

function chooseLoras(style, subjectFlags){
  const tagsWanted = [];
  if (style === "anime") tagsWanted.push(...KEYWORDS.anime);
  if (style === "product") tagsWanted.push(...KEYWORDS.product);
  if (style === "cinematic" || style === "photoreal") tagsWanted.push(...KEYWORDS.cinematic);

  if (subjectFlags.cyberpunk) tagsWanted.push(...KEYWORDS.cyberpunk);
  if (subjectFlags.rain) tagsWanted.push(...KEYWORDS.rain);
  if (subjectFlags.hands) tagsWanted.push(...KEYWORDS.hands);

  const scored = LORAS.map(l => {
    let score = 0;
    for (const t of l.tags){
      if (tagsWanted.some(w => t.toLowerCase().includes(String(w).toLowerCase()) || String(w).includes(t.toLowerCase()))) score += 2;
    }
    if (style === "anime" && l.tags.includes("anime")) score += 4;
    if (style === "product" && l.tags.includes("product")) score += 4;
    if (subjectFlags.hands && l.tags.includes("hands")) score += 4;
    return { ...l, score };
  }).sort((a,b)=>b.score-a.score);

  const top = scored.filter(x => x.score > 0).slice(0, 3);
  const picked = top.length ? top : scored.slice(0, 3);

  return picked.map(x => {
    const mid = (x.strength?.[0] + x.strength?.[1]) / 2;
    return { name: x.name, strength: Number(mid.toFixed(2)) };
  });
}

function buildNegativePrompt(style, subjectFlags){
  const common = [
    "worst quality", "low quality", "blurry", "bad anatomy", "bad proportions",
    "extra fingers", "missing fingers", "fused fingers", "deformed hands"
  ];

  if (subjectFlags.hands) {
    return [...common, "unclear hand pose", "mangled fingers"];
  }

  if (style === "anime") {
    return [...common, "realistic skin texture", "photographic bokeh"];
  }
  if (style === "product") {
    return [...common, "dirty background", "wrinkles", "logo artifacts", "text artifacts"];
  }
  return [...common, "cartoon", "oversaturated", "unrealistic lighting artifacts"];
}

function quantizeSeed(seed, n){
  return Array.from({length:n}, (_,i)=> seed + i*13);
}

function recipeFromInputs({prompt, mode, stylePreset, aspect, quality, consistency, variants}){
  const style = detectStyle(prompt, stylePreset);
  const subjectFlags = detectSubject(prompt);
  const res = aspect === "auto" ? aspectToResolution("auto") : aspectToResolution(aspect);

  const q = Math.max(1, Math.min(10, Number(quality)));
  const baseSteps = (mode === "txt2img") ? (22 + q*2) : (18 + q*2);
  const steps = Math.round(Math.min(55, Math.max(18, baseSteps)));

  const c = Math.max(0, Math.min(100, Number(consistency)));
  const cfg = Number((4 + (c/100)*6).toFixed(1)); // 4..10
  const creativityNote = c < 40 ? "Higher creativity (more drift)." : c > 75 ? "Higher consistency (lower drift)." : "Balanced drift.";
  const sampler = (style === "anime") ? "DPM++ 2M Karras" : "DPM++ SDE Karras";

  const baseModel = chooseBaseModel(style);
  const loras = chooseLoras(style, subjectFlags);
  const negative = buildNegativePrompt(style, subjectFlags);

  const seed = Math.floor(Math.random()*1e9);
  const promptMain = (prompt || "").trim() || "masterpiece, best quality";

  const checks = [];
  if (subjectFlags.hands) checks.push("If hands fail: try Inpaint on hands with lower denoise + optional Hands Fix LoRA.");
  if (subjectFlags.rain) checks.push("If rain/wet look is weak: increase Rain/Wet LoRA strength (about 0.55–0.75).");
  if (style === "product") checks.push("For packshots: use clean background; Product Clean Studio LoRA around ~0.4–0.65.");
  if (!subjectFlags.character) checks.push("For composition: add explicit framing keywords (centered, eye-level, close-up/wide shot).");

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      mode,
      style,
      aspect: aspect === "auto" ? "auto (defaults)" : aspect,
      variants,
      notes: creativityNote
    },
    model: {
      base: baseModel.name,
      family: baseModel.family
    },
    loras,
    prompts: {
      positive: promptMain,
      negative
    },
    generation: {
      sampler,
      steps,
      cfg,
      width: res.w,
      height: res.h,
      seed,
      seedVariants: quantizeSeed(seed, variants),
      img2img: {
        enabled: mode === "img2img",
        denoise: Number(((100-c)/100*0.35 + 0.25).toFixed(2)),
        suggestedResize: "keep aspect; avoid extreme crops"
      },
      inpaint: {
        enabled: mode === "inpaint",
        denoise: Number(((100-c)/100*0.30 + 0.18).toFixed(2))
      }
    },
    recommendedWorkflow: [
      "Run using steps/cfg shown; if faces drift, raise consistency slider.",
      "If artifacts appear, keep steps lower and try a different seed variant.",
      "When composition fails, adjust prompt with explicit framing keywords."
    ],
    checklist: checks
  };
}
