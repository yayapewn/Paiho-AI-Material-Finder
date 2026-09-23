import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const apiKey = process.env.GEMINI_API_KEY;

// Shared Gemini AI instance
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Analysis schema for Gemini
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    product_candidates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          value: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
        },
        required: ['value', 'confidence'],
      },
      description: 'Candidate product categories such as Webbing, Shoelace, Knit Upper, Elastic Band, Hook & Loop, Ribbon, Cord',
    },
    structure_candidates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          value: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
        },
        required: ['value', 'confidence'],
      },
      description: 'Structure categories such as Knit, Woven, Braided, Molded',
    },
    visual_features: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Visual texture and weave features e.g. Mesh, Jacquard, Fine Texture, Plain Weave, Rib, Ripstop',
    },
    color: {
      type: Type.OBJECT,
      properties: {
        primary: { type: Type.STRING },
        secondary: { type: Type.STRING, nullable: true },
        confidence: { type: Type.NUMBER },
      },
      required: ['primary', 'confidence'],
    },
    surface: {
      type: Type.OBJECT,
      properties: {
        texture: { type: Type.STRING },
        gloss: { type: Type.STRING },
        pattern: { type: Type.STRING },
      },
      required: ['texture', 'gloss', 'pattern'],
    },
    possible_functions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          value: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          inferred: { type: Type.BOOLEAN },
        },
        required: ['value', 'confidence', 'inferred'],
      },
      description: 'Possible functions that can only be inferred from texture, e.g. Breathable, Stretch, Soft, Lightweight',
    },
    application_candidates: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Likely target applications like Footwear, Footwear Upper, Shoelace, Apparel, Bags',
    },
    search_keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Normalized search keywords for material library lookup',
    },
    intent_notes: {
      type: Type.OBJECT,
      properties: {
        color_override: { type: Type.STRING, nullable: true },
        ignore_color: { type: Type.BOOLEAN },
        product_emphasis: { type: Type.STRING, nullable: true },
        user_query_summary: { type: Type.STRING },
      },
      required: ['ignore_color', 'user_query_summary'],
    },
  },
  required: [
    'product_candidates',
    'structure_candidates',
    'visual_features',
    'color',
    'surface',
    'possible_functions',
    'application_candidates',
    'search_keywords',
    'intent_notes',
  ],
};

// Candidate models in order of priority for high availability
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

function buildFallbackFeatures(natural_language: string, quick_tags: string[], hasImage: boolean) {
  const combined = `${natural_language} ${quick_tags.join(' ')}`.toLowerCase();

  // Product detection
  const productCandidates: Array<{ value: string; confidence: number }> = [];
  if (/鞋帶|shoelace|lace/.test(combined)) productCandidates.push({ value: 'Shoelace', confidence: 0.9 });
  if (/鞋面|upper|針織鞋面/.test(combined)) productCandidates.push({ value: 'Knit Upper', confidence: 0.9 });
  if (/織帶|webbing|帶/.test(combined)) productCandidates.push({ value: 'Webbing', confidence: 0.85 });
  if (/彈力帶|鬆緊帶|elastic/.test(combined)) productCandidates.push({ value: 'Elastic Band', confidence: 0.9 });
  if (/魔鬼氈|黏扣帶|hook|loop/.test(combined)) productCandidates.push({ value: 'Hook & Loop', confidence: 0.95 });
  if (/緞帶|ribbon/.test(combined)) productCandidates.push({ value: 'Ribbon', confidence: 0.9 });
  if (/繩|cord/.test(combined)) productCandidates.push({ value: 'Cord', confidence: 0.85 });
  if (productCandidates.length === 0) {
    productCandidates.push({ value: 'Webbing', confidence: 0.7 }, { value: 'Knit Upper', confidence: 0.6 });
  }

  // Structure detection
  const structureCandidates: Array<{ value: string; confidence: number }> = [];
  if (/針織|knit/.test(combined)) structureCandidates.push({ value: 'Knit', confidence: 0.95 });
  if (/梭織|woven|平織/.test(combined)) structureCandidates.push({ value: 'Woven', confidence: 0.95 });
  if (/編織|braid/.test(combined)) structureCandidates.push({ value: 'Braided', confidence: 0.95 });
  if (/射出|molded|模壓/.test(combined)) structureCandidates.push({ value: 'Molded', confidence: 0.95 });
  if (structureCandidates.length === 0) {
    structureCandidates.push({ value: 'Knit', confidence: 0.65 }, { value: 'Woven', confidence: 0.65 });
  }

  // Visual features
  const visualFeatures: string[] = [];
  if (/網孔|mesh/.test(combined)) visualFeatures.push('Mesh');
  if (/緹花|jacquard/.test(combined)) visualFeatures.push('Jacquard');
  if (/羅紋|rib/.test(combined)) visualFeatures.push('Rib');
  if (/平紋|plain/.test(combined)) visualFeatures.push('Plain Weave');
  if (/細紋|細緻|fine/.test(combined)) visualFeatures.push('Fine Texture');
  if (/粗獷|coarse/.test(combined)) visualFeatures.push('Coarse');
  if (visualFeatures.length === 0) visualFeatures.push('Fine Texture');

  // Color
  let primaryColor = 'Black';
  let colorOverride: string | null = null;
  let ignoreColor = false;
  if (/白色|white/.test(combined)) {
    primaryColor = 'White';
    colorOverride = 'White';
  } else if (/黑色|black/.test(combined)) {
    primaryColor = 'Black';
    colorOverride = 'Black';
  } else if (/藍色|blue/.test(combined)) {
    primaryColor = 'Blue';
    colorOverride = 'Blue';
  } else if (/灰色|gray|grey/.test(combined)) {
    primaryColor = 'Gray';
    colorOverride = 'Gray';
  } else if (/綠色|green/.test(combined)) {
    primaryColor = 'Green';
    colorOverride = 'Green';
  } else if (/紅色|red/.test(combined)) {
    primaryColor = 'Red';
    colorOverride = 'Red';
  }
  if (/不限顏色|顏色不拘|任意顏色|不拘|ignore color/.test(combined)) {
    ignoreColor = true;
  }

  // Functions
  const possibleFunctions: Array<{ value: string; confidence: number; inferred: boolean }> = [];
  if (/透氣|breathable/.test(combined)) possibleFunctions.push({ value: 'Breathable', confidence: 0.9, inferred: true });
  if (/彈性|stretch|elastic/.test(combined)) possibleFunctions.push({ value: 'Stretch', confidence: 0.9, inferred: true });
  if (/反光|reflective/.test(combined)) possibleFunctions.push({ value: 'Reflective', confidence: 0.9, inferred: true });
  if (/輕量|lightweight/.test(combined)) possibleFunctions.push({ value: 'Lightweight', confidence: 0.85, inferred: true });
  if (/耐磨|abrasion/.test(combined)) possibleFunctions.push({ value: 'Abrasion Resistant', confidence: 0.85, inferred: true });
  if (/柔軟|soft/.test(combined)) possibleFunctions.push({ value: 'Soft', confidence: 0.85, inferred: true });
  if (/回收|環保|recycled/.test(combined)) possibleFunctions.push({ value: 'Recycled', confidence: 0.95, inferred: true });
  if (possibleFunctions.length === 0) {
    possibleFunctions.push({ value: 'Breathable', confidence: 0.7, inferred: true });
  }

  // Applications
  const applicationCandidates: string[] = [];
  if (/鞋|footwear|shoe/.test(combined)) applicationCandidates.push('Footwear');
  if (/鞋面|upper/.test(combined)) applicationCandidates.push('Footwear Upper');
  if (/鞋帶|shoelace/.test(combined)) applicationCandidates.push('Shoelace');
  if (/成衣|apparel|衣服|服裝/.test(combined)) applicationCandidates.push('Apparel');
  if (/包|bag|背包/.test(combined)) applicationCandidates.push('Bags');
  if (applicationCandidates.length === 0) applicationCandidates.push('Footwear', 'Apparel');

  // Search keywords
  const searchKeywords = Array.from(new Set([
    ...productCandidates.map(p => p.value),
    ...structureCandidates.map(s => s.value),
    ...visualFeatures,
    ...possibleFunctions.map(f => f.value),
    primaryColor,
  ]));

  return {
    product_candidates: productCandidates,
    structure_candidates: structureCandidates,
    visual_features: visualFeatures,
    color: {
      primary: primaryColor,
      secondary: null,
      confidence: 0.8,
    },
    surface: {
      texture: visualFeatures[0] || 'Fine Texture',
      gloss: 'Matte',
      pattern: visualFeatures[0] || 'Plain',
    },
    possible_functions: possibleFunctions,
    application_candidates: applicationCandidates,
    search_keywords: searchKeywords,
    intent_notes: {
      color_override: colorOverride,
      ignore_color: ignoreColor,
      product_emphasis: productCandidates[0]?.value || null,
      user_query_summary: natural_language || quick_tags.join(', ') || '樣品材料搜尋',
    },
  };
}

// Helper: Call Gemini with fallback models and retry on 503 / 429
async function generateContentWithFallback(contentsParts: any[]) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      console.log(`[AI Analyze] Attempting analysis with model: ${model}`);
      const response = await ai!.models.generateContent({
        model,
        contents: { parts: contentsParts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: analysisSchema,
          systemInstruction:
            'You are a professional textile inspection AI assistant for Paiho Material Finder. You output strict JSON without markdown formatting or pleasantries.',
        },
      });

      const responseText = response.text || '{}';
      const parsedFeatures = JSON.parse(responseText);
      console.log(`[AI Analyze] Successfully analyzed with ${model}`);
      return { features: parsedFeatures, modelUsed: model };
    } catch (err: any) {
      console.warn(`[AI Analyze] Model ${model} encountered issue:`, err?.message || err);
      lastError = err;

      const isHighDemandOrRateLimit =
        err?.message?.includes('503') ||
        err?.message?.includes('429') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE');

      if (isHighDemandOrRateLimit) {
        // Brief pause before trying fallback model
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }

      // Check if not found (404)
      if (err?.message?.includes('404') || err?.message?.includes('NOT_FOUND')) {
        continue;
      }

      // If other errors, also try next model
      continue;
    }
  }

  throw lastError || new Error('所有可用 AI 模型目前暫時無法連線。');
}

// API route: analyze image & user requirements
app.post('/api/analyze', async (req, res) => {
  try {
    const { image, natural_language = '', quick_tags = [] } = req.body;

    if (!image && !natural_language && (!quick_tags || quick_tags.length === 0)) {
      return res.status(400).json({
        error: '請提供材料照片、文字需求或選取關鍵字。',
      });
    }

    if (!ai) {
      // If no API key configured, use fallback features gracefully
      const fallbackFeatures = buildFallbackFeatures(natural_language, quick_tags, !!image);
      return res.json({
        features: fallbackFeatures,
        search_id: `SRCH_HEURISTIC_${Date.now()}`,
        fallback: true,
        notice: '系統尚未設定 GEMINI_API_KEY，已自動採用智慧規則比對特徵。',
      });
    }

    const contentsParts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [];

    // Process image if provided
    if (image && typeof image === 'string') {
      let mimeType = 'image/jpeg';
      let base64Data = image;

      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }

      contentsParts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    const promptText = `
You are an expert textile and footwear trim engineer analyzing materials for Paiho (台灣百和).
The user wants to find similar materials from the Paiho Material Library.

User Natural Language Requirement: "${natural_language}"
User Selected Quick Tags: ${JSON.stringify(quick_tags)}

CRITICAL INSTRUCTIONS:
1. NEVER hallucinate or invent Paiho material IDs (e.g. do not guess 'MTK341'). You only extract standardized physical features.
2. Analyze VISIBLE features accurately:
   - Structure: Knit, Woven, Braided, Molded.
   - Surface texture: Mesh, Jacquard, Rib, Plain, Fine, Coarse, Hexagonal, Twill.
   - Primary and secondary color.
   - Product type: Webbing, Shoelace, Knit Upper, Elastic Band, Hook & Loop, Ribbon, Cord.
3. INFERRED vs VISIBLE:
   - Breathability, Stretch, Softness, Thickness can only be inferred (mark inferred: true).
   - DO NOT claim specific chemical composition (e.g. Spandex %, Nylon vs Polyester) or test certifications (GRS, OEKO-TEX, abrasion cycles) from image alone.
4. NATURAL LANGUAGE INTENT PRIORITY:
   - If user explicitly requested a specific color (e.g. "跟照片一樣但要白色" or "白色"), set intent_notes.color_override to "White".
   - If user says "不限顏色" or "顏色不拘", set intent_notes.ignore_color to true.
   - If user says "我要鞋帶用", set intent_notes.product_emphasis to "Shoelace".
5. Return strictly valid JSON adhering to the provided schema.
`;

    contentsParts.push({ text: promptText });

    try {
      const { features, modelUsed } = await generateContentWithFallback(contentsParts);
      return res.json({
        features,
        search_id: `SRCH_${Date.now()}`,
        model_used: modelUsed,
      });
    } catch (aiError: any) {
      console.warn('[AI Analyze] All AI models temporarily unavailable. Using heuristic fallback:', aiError);
      // Fallback gracefully so user's search is never broken by Google 503 high demand spike!
      const fallbackFeatures = buildFallbackFeatures(natural_language, quick_tags, !!image);
      return res.json({
        features: fallbackFeatures,
        search_id: `SRCH_HEURISTIC_${Date.now()}`,
        fallback: true,
        notice: '目前 AI 模型處於高負載繁忙狀態，已自動啟用備援解析特徵為您完成搜尋。',
      });
    }
  } catch (error: any) {
    console.error('Error analyzing material:', error);
    let message = '分析材料特徵時發生錯誤，請稍後再試。';

    if (error?.message) {
      if (error.message.includes('API_KEY_INVALID')) {
        message = 'Gemini API 金鑰無效，請檢查設定。';
      } else if (error.message.includes('503') || error.message.includes('high demand') || error.message.includes('UNAVAILABLE')) {
        message = 'AI 模型目前伺服器負載較高，請稍候重試。';
      } else if (error.message.includes('{')) {
        // Try parsing nested JSON error
        try {
          const jsonMatch = error.message.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.error?.message) {
              message = `AI 服務繁忙 (${parsed.error.message})，請重試。`;
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    return res.status(500).json({ error: message });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'paiho-ai-material-finder' });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  // Serve static public assets (material swatch images, etc.)
  const publicPath = path.resolve(__dirname, 'public');
  app.use(express.static(publicPath));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
