import {
  NormalizedSearchFeatures,
  SearchAnalysisResponse,
} from '../types/search';

export async function analyzeMaterialWithAI(
  imageDataUrl: string | null,
  naturalLanguage: string,
  quickTags: string[]
): Promise<NormalizedSearchFeatures> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageDataUrl,
      natural_language: naturalLanguage.trim(),
      quick_tags: quickTags,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = errorData.error || `伺服器回應錯誤 (${response.status})，請稍後再試。`;
    
    // Check if error is raw JSON or 503 high demand
    if (typeof msg === 'string') {
      if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
        msg = 'AI 模型伺服器目前繁忙中，請稍候點選「再試一次」。';
      } else if (msg.startsWith('{') && msg.endsWith('}')) {
        try {
          const parsed = JSON.parse(msg);
          msg = parsed.error?.message || msg;
        } catch {
          // ignore
        }
      }
    }
    
    throw new Error(msg);
  }

  const data: SearchAnalysisResponse = await response.json();
  return data.features;
}
