// Prompt component database for randomization.

const PROMPT_COMPONENTS = {
  styles: [
    { text: "cinematic lighting, moody atmosphere, volumetric light", weight: { base: 1.2, anime: 0, product: 0.2 } },
    { text: "photorealistic, 35mm film, DSLR bokeh, realistic skin texture", weight: { photoreal: 1.4, cinematic: 0.8 } },
    { text: "anime style, cel shading, clean lineart", weight: { anime: 1.5 } },
    { text: "clean studio product photo, packshot, high detail", weight: { product: 1.5 } }
  ],
  subjects: [
    { text: "cyberpunk detective", weight: { cyberpunk: 1.6, cinematic: 0.8 } },
    { text: "woman portrait, confident expression", weight: { character: 1.2, photoreal: 1.0 } },
    { text: "hero character full-body, dramatic pose", weight: { character: 1.1 } },
    { text: "cosplay character, detailed costume", weight: { character: 1.0, anime: 0.8 } },
    { text: "luxury watch product shot", weight: { product: 1.6 } }
  ],
  lighting: [
    { text: "neon rim light, blue-magenta color grading", weight: { cyberpunk: 1.6 } },
    { text: "golden hour, soft sunlight, gentle bloom", weight: { cinematic: 1.0 } },
    { text: "studio lighting, softbox reflections, crisp highlights", weight: { product: 1.6, photoreal: 0.6 } },
    { text: "dramatic rim light, high contrast, subtle haze", weight: { cinematic: 1.4 } }
  ],
  environments: [
    { text: "rainy street at night, wet asphalt reflections", weight: { rain: 1.6, cyberpunk: 1.2 } },
    { text: "modern interior room, shallow depth of field background", weight: { environment: 1.0 } },
    { text: "futuristic city skyline, distant lights bokeh", weight: { cyberpunk: 1.6 } },
    { text: "minimal white studio background, soft shadow", weight: { product: 1.8 } }
  ],
  camera: [
    { text: "eye-level, 35mm lens, f/1.8", weight: { photoreal: 1.2, cinematic: 0.9 } },
    { text: "close-up, macro detail, sharp focus", weight: { product: 1.6 } },
    { text: "wide shot, dynamic perspective", weight: { cinematic: 1.0 } },
    { text: "portrait framing, shoulders up", weight: { character: 1.0, anime: 0.6 } }
  ],
  effects: [
    { text: "volumetric fog, subtle film grain", weight: { cinematic: 1.2 } },
    { text: "bokeh highlights, light bloom, gentle haze", weight: { photoreal: 1.0 } },
    { text: "rain mist, reflective puddles, chromatic aberration", weight: { rain: 1.5 } },
    { text: "soft cel shading highlights, vibrant colors", weight: { anime: 1.2 } }
  ]
};

const KEYWORD_KEYS = {
  photoreal: ["photoreal","realistic","DSLR","35mm","bokeh","film"],
  anime: ["anime","manga","cel shading","lineart","gacha"],
  cinematic: ["cinematic","dramatic","rim light","volumetric","golden hour","moody","35mm"],
  product: ["product","packshot","studio lighting","on white background","ecommerce","macro","label"],
  cyberpunk: ["cyberpunk","neon","chrome","hologram"],
  rain: ["rain","wet","storm","drizzle"],
  character: ["portrait","woman","man","hero","detective","cosplay","full-body"],
  environment: ["city","street","forest","room","interior","landscape","background"]
};
