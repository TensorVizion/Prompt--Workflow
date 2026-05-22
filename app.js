const $ = (id) => document.getElementById(id);

const promptEl = $("prompt");
const modeEl = $("mode");
const stylePresetEl = $("stylePreset");
const aspectEl = $("aspect");
const qualityEl = $("quality");
const consistencyEl = $("consistency");
const variantsEl = $("variants");

const qualityVal = $("qualityVal");
const consistencyVal = $("consistencyVal");

const outEl = $("output");
const checklistEl = $("checklist");

const genBtn = $("genBtn");
const copyBtn = $("copyBtn");
const downloadBtn = $("downloadBtn");

// Randomizer UI
const tempEl = $("temp");
const tempVal = $("tempVal");
const varCountEl = $("varCount");
const randBtn = $("randBtn");
const randOutputEl = $("randOutput");
const saveAllBtn = $("saveAllBtn");
const saveCurrentBtn = $("saveCurrentBtn");
const recipesForVariationsBtn = $("recipesForVariationsBtn");
const downloadRecipesBtn = $("downloadRecipesBtn");

// Organizer UI
const organizerListEl = $("organizerList");
const searchPromptsEl = $("searchPrompts");
const tagFilterEl = $("tagFilter");
const tagInputEl = $("tagInput");
const deleteFilteredBtn = $("deleteFilteredBtn");
const clearAllBtn = $("clearAllBtn");

let lastRecipe = null;
let currentVariations = [];
let currentBatchRecipes = [];

function renderRecipe(recipe){
  lastRecipe = recipe;
  outEl.textContent = JSON.stringify(recipe, null, 2);

  checklistEl.innerHTML = "";
  const items = [
    ...(recipe.checklist || []),
    ...(recipe.recommendedWorkflow || [])
  ].map(x => String(x).replace(/\.$/, ""));

  for (const item of items){
    const li = document.createElement("li");
    li.textContent = item;
    checklistEl.appendChild(li);
  }

  copyBtn.disabled = false;
  downloadBtn.disabled = false;
}

function recipeToDownloadBlob(obj){
  return new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
}

// ----- Download/Copy -----
genBtn.addEventListener("click", () => {
  const recipe = recipeFromInputs({
    prompt: promptEl.value,
    mode: modeEl.value,
    stylePreset: stylePresetEl.value,
    aspect: aspectEl.value,
    quality: qualityEl.value,
    consistency: consistencyEl.value,
    variants: Number(variantsEl.value || 1)
  });
  renderRecipe(recipe);
});

qualityEl.addEventListener("input", () => qualityVal.textContent = qualityEl.value);
consistencyEl.addEventListener("input", () => consistencyVal.textContent = consistencyEl.value);

copyBtn.addEventListener("click", async () => {
  if (!lastRecipe) return;
  await navigator.clipboard.writeText(JSON.stringify(lastRecipe, null, 2));
  copyBtn.textContent = "Copied!";
  setTimeout(()=> copyBtn.textContent = "Copy", 900);
});

downloadBtn.addEventListener("click", () => {
  if (!lastRecipe) return;
  const blob = recipeToDownloadBlob(lastRecipe);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prompt-recipe-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// ----- Randomizer -----
tempVal.textContent = tempEl.value;

tempEl.addEventListener("input", () => tempVal.textContent = tempEl.value);

randBtn.addEventListener("click", () => {
  const anchor = promptEl.value;
  const temperature = Number(tempEl.value);
  const count = Number(varCountEl.value || 1);

  currentVariations = window.promptRandomizer.generateVariations({
    anchorPrompt: anchor,
    temperature,
    count
  });

  randOutputEl.textContent = currentVariations
    .map((p, i) => `#${i+1}\n${p}`)
    .join("\n\n---\n\n");

  // enable batch recipes download later
  currentBatchRecipes = [];
  downloadRecipesBtn.disabled = true;
});

// Save to organizer helpers
const LS_KEY = "promptOrganizer.v2";

function loadOrganizer(){
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveOrganizer(items){
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

function createOrganizerItem(promptText, {name, tags} = {}){
  return {
    id: Math.random().toString(16).slice(2),
    name: name || "",
    prompt: String(promptText || ""),
    tags: Array.isArray(tags) ? tags : [],
    createdAt: Date.now()
  };
}

function parseTags(str){
  return (str || "")
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);
}

// Save all variations
saveAllBtn.addEventListener("click", () => {
  if (!currentVariations.length) return;

  const tags = parseTags(tagInputEl.value);
  const items = loadOrganizer();

  for (const p of currentVariations){
    items.push(createOrganizerItem(p, { tags }));
  }

  saveOrganizer(items);
  renderOrganizer();
  alert("Saved all variations to organizer.");
});

// Save current anchor prompt
saveCurrentBtn.addEventListener("click", () => {
  const anchor = promptEl.value;
  const tags = parseTags(tagInputEl.value);

  if (!anchor.trim()){
    alert("Prompt is empty.");
    return;
  }

  const items = loadOrganizer();
  items.push(createOrganizerItem(anchor, { tags }));
  saveOrganizer(items);
  renderOrganizer();
  alert("Saved anchor prompt to organizer.");
});

// ----- Batch: recipe for each variation (NEW) -----
recipesForVariationsBtn.addEventListener("click", () => {
  if (!currentVariations.length){
    alert("Generate variations first.");
    return;
  }

  // Use same generator settings, but recipe prompt = each variation
  const mode = modeEl.value;
  const stylePreset = stylePresetEl.value;
  const aspect = aspectEl.value;
  const quality = qualityEl.value;
  const consistency = consistencyEl.value;
  const variants = Number(variantsEl.value || 1);

  currentBatchRecipes = currentVariations.map((p) =>
    recipeFromInputs({
      prompt: p,
      mode,
      stylePreset,
      aspect,
      quality,
      consistency,
      variants
    })
  );

  // show summary in output area
  outEl.textContent = JSON.stringify(
    { meta: { count: currentBatchRecipes.length }, recipes: currentBatchRecipes },
    null,
    2
  );

  checklistEl.innerHTML = "";
  const li = document.createElement("li");
  li.textContent = "Batch mode: recipe generated for each variation. Use Download recipes.json to export.";
  checklistEl.appendChild(li);

  downloadRecipesBtn.disabled = false;
  copyBtn.disabled = false;
  downloadBtn.disabled = true; // batch has its own download
});

downloadRecipesBtn.addEventListener("click", () => {
  if (!currentBatchRecipes.length) return;
  const blob = recipeToDownloadBlob({
    meta: { count: currentBatchRecipes.length },
    recipes: currentBatchRecipes
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `recipes-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// ----- Organizer rendering (click to load + delete filtered) -----
function fmtDate(ts){
  try { return new Date(ts).toLocaleString(); } catch { return ""; }
}

function renderOrganizer(){
  const list = loadOrganizer();
  const q = (searchPromptsEl.value || "").toLowerCase().trim();
  const tag = (tagFilterEl.value || "").toLowerCase().trim();

  let filtered = list;
  if (q){
    filtered = filtered.filter(x =>
      (x.prompt || "").toLowerCase().includes(q) ||
      (x.name || "").toLowerCase().includes(q)
    );
  }
  if (tag){
    filtered = filtered.filter(x => (x.tags || []).some(t => String(t).toLowerCase() === tag));
  }

  filtered.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));

  organizerListEl.innerHTML = "";
  if (!filtered.length){
    const empty = document.createElement("div");
    empty.className = "hint";
    empty.textContent = "No saved prompts match your filters.";
    organizerListEl.appendChild(empty);
    return;
  }

  for (const item of filtered.slice(0, 50)){
    const wrap = document.createElement("div");
    wrap.className = "promptItem";

    const top = document.createElement("div");
    top.className = "promptItemTop";

    const left = document.createElement("div");
    const title = document.createElement("div");
    title.className = "promptItemTitle";
    title.textContent = item.name ? item.name : "Saved Prompt";

    const meta = document.createElement("div");
    meta.className = "promptItemMeta";
    const tags = (item.tags || []).join(", ");
    meta.textContent = `${fmtDate(item.createdAt)}${tags ? " • tags: " + tags : ""}`;

    left.appendChild(title);
    left.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "promptItemActions";

    const loadBtn = document.createElement("button");
    loadBtn.className = "smallBtn";
    loadBtn.textContent = "Load";
    loadBtn.addEventListener("click", () => {
      promptEl.value = item.prompt || "";
      alert("Loaded prompt into the main box.");
    });

    const delBtn = document.createElement("button");
    delBtn.className = "smallBtn danger";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      const all = loadOrganizer();
      const idx = all.findIndex(x => x.id === item.id);
      if (idx >= 0) {
        all.splice(idx, 1);
        saveOrganizer(all);
        renderOrganizer();
      }
    });

    actions.appendChild(loadBtn);
    actions.appendChild(delBtn);

    top.appendChild(left);
    top.appendChild(actions);

    const body = document.createElement("div");
    body.className = "promptItemPrompt";
    body.textContent = item.prompt || "";

    wrap.appendChild(top);
    wrap.appendChild(body);
    organizerListEl.appendChild(wrap);
  }
}

searchPromptsEl.addEventListener("input", renderOrganizer);
tagFilterEl.addEventListener("input", renderOrganizer);

deleteFilteredBtn.addEventListener("click", () => {
  const list = loadOrganizer();
  const q = (searchPromptsEl.value || "").toLowerCase().trim();
  const tag = (tagFilterEl.value || "").toLowerCase().trim();

  const before = list.length;

  let keep = list.filter(x => {
    const okQ = q ? (x.prompt || "").toLowerCase().includes(q) || (x.name||"").toLowerCase().includes(q) : true;
    const okTag = tag ? (x.tags || []).some(t => String(t).toLowerCase() === tag) : true;

    // "matches" means we DELETE those that match BOTH filters
    const matches = okQ && okTag;
    return !matches; // keep non-matching
  });

  saveOrganizer(keep);
  alert(`Deleted ${before - keep.length} item(s).`);
  renderOrganizer();
});

clearAllBtn.addEventListener("click", () => {
  if (!confirm("Clear ALL saved prompts?")) return;
  localStorage.removeItem(LS_KEY);
  renderOrganizer();
});

// initial render
renderOrganizer();
qualityVal.textContent = qualityEl.value;
consistencyVal.textContent = consistencyEl.value;
