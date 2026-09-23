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
      return res.status(500).json({
        error: '系統尚未設定 GEMINI_API_KEY。請在 Secrets 面板中設定金鑰。',
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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

    return res.json({
      features: parsedFeatures,
      search_id: `SRCH_${Date.now()}`,
    });
  } catch (error: any) {
    console.error('Error analyzing material:', error);
    const message =
      error?.message?.includes('API_KEY_INVALID')
        ? 'Gemini API 金鑰無效，請檢查設定。'
        : error?.message || '分析材料特徵時發生錯誤，請稍後再試。';

    return res.status(500).json({ error: message });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'paiho-ai-material-finder' });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

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
