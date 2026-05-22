// Browser global: window.promptRandomizer

function tokenize(s){ return (s || "").toLowerCase(); }

function detectKeys(text){
  const p = tokenize(text);
  const keys = [];
  for (const [k, words] of Object.entries(KEYWORD_KEYS)){
    if (words.some(w => p.includes(w))) keys.push(k);
  }
  if (keys.length === 0) keys.push("cinematic");
  return keys;
}

function weightedPick(items, activeKeys, temperature){
  const t = Math.max(0, Math.min(100, temperature)) / 100;

  const scored = items.map(it => {
    let w = 1;
    if (it.weight) {
      w = it.weight.base ?? 1;
      for (const ak of activeKeys){
        if (it.weight[ak] != null) w *= it.weight[ak];
      }
    }
    const jitter = (Math.random() * 2 - 1) * (t * 0.6); // +/- jitter
    const score = w * (1 + jitter);
    return { it, score };
  }).sort((a,b)=>b.score-a.score);

  // With higher temp: sometimes allow deeper pick
  const pickIndex = Math.random() < t
    ? Math.floor(Math.random() * Math.min(3, scored.length))
    : 0;

  return scored[pickIndex]?.it?.text || scored[0]?.it?.text || "";
}

function buildPromptVariation(anchorPrompt, temperature, activeKeys){
  const anchor = (anchorPrompt || "").trim();

  const chosen = [];
  chosen.push(weightedPick(PROMPT_COMPONENTS.styles, activeKeys, temperature));
  chosen.push(weightedPick(PROMPT_COMPONENTS.subjects, activeKeys, temperature));
  chosen.push(weightedPick(PROMPT_COMPONENTS.lighting, activeKeys, temperature));
  chosen.push(weightedPick(PROMPT_COMPONENTS.environments, activeKeys, temperature));
  chosen.push(weightedPick(PROMPT_COMPONENTS.camera, activeKeys, temperature));
  chosen.push(weightedPick(PROMPT_COMPONENTS.effects, activeKeys, temperature));

  const parts = chosen.filter(Boolean);
  let prompt = parts.join(", ");

  // weave anchor at front
  if (anchor) prompt = `${anchor}, ${prompt}`;

  return prompt;
}

function generateVariations({ anchorPrompt, temperature, count }){
  const keys = detectKeys(anchorPrompt);
  const out = [];
  for (let i=0; i<count; i++){
    out.push(buildPromptVariation(anchorPrompt, temperature, keys));
  }
  // uniqueness (stable)
  return Array.from(new Set(out));
}

window.promptRandomizer = { generateVariations };
