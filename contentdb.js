// Minimal starter catalog. Expand with real Civitai/TensorArt names + tags as you grow.

const MODELS = [
  { name: "SDXL Base (Generic)", family: "sdxl", tags: ["photoreal","cinematic","general"] },
  { name: "Anime Model (Generic)", family: "sd1.5", tags: ["anime","illustration"] },
  { name: "Realistic Vision-style", family: "sd1.5", tags: ["photoreal","portrait","cinematic"] }
];

const LORAS = [
  { name: "Neon Cyberpunk Lights", tags: ["cyberpunk","neon","night","lights"], strength: [0.4, 0.8] },
  { name: "Cinematic Lighting", tags: ["cinematic","dramatic","rimlight","contrast"], strength: [0.3, 0.7] },
  { name: "Rain / Wet Surfaces", tags: ["rain","wet","neon","reflections"], strength: [0.35, 0.75] },
  { name: "Portrait Face Detail", tags: ["portrait","face","skin","detail"], strength: [0.25, 0.6] },
  { name: "Product Clean Studio", tags: ["product","studio","clean","packshot"], strength: [0.35, 0.7] },
  { name: "Anime Lineart + Color", tags: ["anime","lineart","celshading","illustration"], strength: [0.4, 0.9] },
  { name: "Hands Fix / Detail", tags: ["hands","fingers","anatomy"], strength: [0.2, 0.5] }
];

const KEYWORDS = {
  anime: ["anime","manga","cel shading","gacha"],
  photoreal: ["photoreal","photo-real","realistic","DSLR","35mm","film","bokeh"],
  cinematic: ["cinematic","dramatic lighting","rim light","golden hour","moody","volumetric","35mm"],
  product: ["product","packshot","studio lighting","on white background","ecommerce","macro","label"],
  hands: ["hands","fingers","hand","gloves"],
  rain: ["rain","wet","storm","drizzle"],
  cyberpunk: ["cyberpunk","neon","chrome","hologram"],
  character: ["character","portrait","woman","man","hero","detective","cosplay","wearing"],
  environment: ["city","street","forest","room","interior","landscape","background"]
};
