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
    throw new Error(
      errorData.error || `伺服器回應錯誤 (${response.status})，請稍後再試。`
    );
  }

  const data: SearchAnalysisResponse = await response.json();
  return data.features;
}
