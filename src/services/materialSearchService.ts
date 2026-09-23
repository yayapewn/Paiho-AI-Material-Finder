import { Material } from '../types/material';
import {
  NormalizedSearchFeatures,
  MaterialSearchResult,
  MatchReasons,
  ScoreBreakdown,
} from '../types/search';

interface WeightConfig {
  visual: number;
  product: number;
  structure: number;
  feature: number;
  intent: number;
  color: number;
}

export class MaterialSearchService {
  /**
   * Performs hybrid ranking against candidate materials from the library.
   */
  public rankMaterials(
    materials: Material[],
    features: NormalizedSearchFeatures,
    userQuery: string = '',
    quickTags: string[] = []
  ): MaterialSearchResult[] {
    const queryLower = userQuery.toLowerCase();
    const tagListLower = quickTags.map((t) => t.toLowerCase());

    // 1. Detect dynamic weighting conditions
    const isIgnoreColor =
      features.intent_notes?.ignore_color ||
      queryLower.includes('不限顏色') ||
      queryLower.includes('不限制顏色') ||
      queryLower.includes('任何顏色') ||
      queryLower.includes('顏色不拘');

    const hasStrongProductIntent =
      Boolean(features.intent_notes?.product_emphasis) ||
      queryLower.includes('鞋帶') ||
      queryLower.includes('shoelace') ||
      queryLower.includes('鞋面') ||
      queryLower.includes('upper') ||
      queryLower.includes('織帶') ||
      queryLower.includes('webbing') ||
      queryLower.includes('魔鬼氈') ||
      queryLower.includes('包邊');

    // Base weights: Visual 45%, Product 15%, Structure 15%, Feature 10%, Intent 10%, Color 5%
    let weights: WeightConfig = {
      visual: 0.45,
      product: 0.15,
      structure: 0.15,
      feature: 0.1,
      intent: 0.1,
      color: 0.05,
    };

    if (isIgnoreColor) {
      weights.color = 0;
    }

    if (hasStrongProductIntent) {
      weights.product = 0.25;
      weights.visual = 0.38;
      weights.structure = 0.14;
      weights.feature = 0.09;
      weights.intent = 0.14;
      if (weights.color > 0) weights.color = 0.0;
    }

    // Normalize weights so sum = 1
    const weightSum =
      weights.visual +
      weights.product +
      weights.structure +
      weights.feature +
      weights.intent +
      weights.color;

    weights = {
      visual: weights.visual / weightSum,
      product: weights.product / weightSum,
      structure: weights.structure / weightSum,
      feature: weights.feature / weightSum,
      intent: weights.intent / weightSum,
      color: weights.color / weightSum,
    };

    // Color intent override (e.g. "我要白色", "換成白色")
    const targetColor =
      features.intent_notes?.color_override ||
      (queryLower.includes('白色') || tagListLower.includes('白色 white') ? 'white' : null) ||
      (queryLower.includes('黑色') || tagListLower.includes('黑色 black') ? 'black' : null) ||
      features.color.primary.toLowerCase();

    // 2. Score each material
    const scoredResults: MaterialSearchResult[] = materials.map((material) => {
      // A. Visual / Appearance similarity (45%)
      const visualScore = this.computeVisualScore(material, features);

      // B. Product match (15%)
      const productScore = this.computeProductScore(material, features, queryLower, quickTags);

      // C. Structure match (15%)
      const structureScore = this.computeStructureScore(material, features, quickTags);

      // D. Feature match (10%)
      const featureScore = this.computeFeatureScore(material, features, quickTags);

      // E. User Intent & Keywords match (10%)
      const intentScore = this.computeIntentScore(material, queryLower, quickTags, features);

      // F. Color match (5%)
      const colorScore = isIgnoreColor ? 1 : this.computeColorScore(material, targetColor);

      const totalWeighted =
        visualScore * weights.visual +
        productScore * weights.product +
        structureScore * weights.structure +
        featureScore * weights.feature +
        intentScore * weights.intent +
        colorScore * weights.color;

      // Scale to 0-100%, slightly curve for realistic top textile matching (e.g. 70-96%)
      const similarityPercent = Math.min(
        99,
        Math.max(15, Math.round(totalWeighted * 100))
      );

      const breakdown: ScoreBreakdown = {
        visual: Math.round(visualScore * 100),
        product: Math.round(productScore * 100),
        structure: Math.round(structureScore * 100),
        feature: Math.round(featureScore * 100),
        intent: Math.round(intentScore * 100),
        color: Math.round(colorScore * 100),
        total: similarityPercent,
      };

      const match_reasons = this.deriveMatchReasons(
        material,
        features,
        targetColor,
        isIgnoreColor,
        quickTags
      );

      return {
        material,
        similarity: similarityPercent,
        match_reasons,
        score_breakdown: breakdown,
      };
    });

    // Sort by similarity descending
    scoredResults.sort((a, b) => b.similarity - a.similarity);

    // Return Top 5
    return scoredResults.slice(0, 5);
  }

  private computeVisualScore(material: Material, features: NormalizedSearchFeatures): number {
    let score = 0.3; // base baseline
    const matDesc = (
      (material.visual_description || '') +
      ' ' +
      (material.construction || []).join(' ') +
      ' ' +
      material.name_zh +
      ' ' +
      material.name_en
    ).toLowerCase();

    // Check visual features match
    const vf = features.visual_features || [];
    for (const v of vf) {
      if (matDesc.includes(v.toLowerCase())) {
        score += 0.18;
      }
    }

    // Check pattern & texture
    if (
      features.surface.pattern &&
      matDesc.includes(features.surface.pattern.toLowerCase())
    ) {
      score += 0.2;
    }
    if (
      features.surface.texture &&
      matDesc.includes(features.surface.texture.toLowerCase())
    ) {
      score += 0.15;
    }

    return Math.min(1, score);
  }

  private computeProductScore(
    material: Material,
    features: NormalizedSearchFeatures,
    queryLower: string,
    quickTags: string[]
  ): number {
    const matProducts = material.product.map((p) => p.toLowerCase());
    const candidates = features.product_candidates || [];

    for (const c of candidates) {
      const cVal = c.value.toLowerCase();
      if (matProducts.some((p) => p.includes(cVal) || cVal.includes(p))) {
        return Math.min(1, c.confidence || 0.85);
      }
    }

    // Check query hints
    if (
      (queryLower.includes('鞋帶') || quickTags.some((t) => t.includes('鞋帶'))) &&
      matProducts.includes('shoelace')
    ) {
      return 1.0;
    }
    if (
      (queryLower.includes('鞋面') || quickTags.some((t) => t.includes('鞋面'))) &&
      (matProducts.includes('knit upper') || material.application.includes('Footwear Upper'))
    ) {
      return 1.0;
    }
    if (
      (queryLower.includes('織帶') || quickTags.some((t) => t.includes('織帶'))) &&
      matProducts.includes('webbing')
    ) {
      return 1.0;
    }

    return 0.35;
  }

  private computeStructureScore(
    material: Material,
    features: NormalizedSearchFeatures,
    quickTags: string[]
  ): number {
    const matStructs = material.structure.map((s) => s.toLowerCase());
    const candidates = features.structure_candidates || [];

    // Tag override or bonus
    const tagKnit = quickTags.some((t) => t.includes('針織'));
    const tagWoven = quickTags.some((t) => t.includes('梭織'));
    if (tagKnit && matStructs.includes('knit')) return 1.0;
    if (tagWoven && matStructs.includes('woven')) return 1.0;

    for (const c of candidates) {
      const cVal = c.value.toLowerCase();
      if (matStructs.some((s) => s.includes(cVal) || cVal.includes(s))) {
        return Math.min(1, c.confidence || 0.8);
      }
    }

    return 0.3;
  }

  private computeFeatureScore(
    material: Material,
    features: NormalizedSearchFeatures,
    quickTags: string[]
  ): number {
    const matFeatures = [
      ...material.feature,
      ...material.construction,
      ...material.process,
    ].map((f) => f.toLowerCase());

    let matchCount = 0;
    const vf = features.visual_features.map((f) => f.toLowerCase());
    for (const f of vf) {
      if (matFeatures.some((mf) => mf.includes(f) || f.includes(mf))) {
        matchCount++;
      }
    }

    // Quick tags consideration
    for (const tag of quickTags) {
      const t = tag.toLowerCase();
      if (matFeatures.some((mf) => t.includes(mf) || mf.includes(t))) {
        matchCount += 1.5;
      }
    }

    return Math.min(1, 0.35 + matchCount * 0.2);
  }

  private computeIntentScore(
    material: Material,
    queryLower: string,
    quickTags: string[],
    features: NormalizedSearchFeatures
  ): number {
    if (!queryLower && quickTags.length === 0) return 0.85;

    const allMatText = (
      material.search_text +
      ' ' +
      material.name_zh +
      ' ' +
      material.name_en +
      ' ' +
      material.function.join(' ') +
      ' ' +
      material.application.join(' ')
    ).toLowerCase();

    let matches = 0;
    const keywords = [
      ...features.search_keywords,
      ...quickTags.map((t) => t.split(' ')[0]),
    ];

    for (const kw of keywords) {
      if (kw && allMatText.includes(kw.toLowerCase())) {
        matches++;
      }
    }

    // Check specific intent terms
    if (queryLower.includes('透氣') && material.function.includes('Breathable')) matches += 2;
    if (queryLower.includes('彈性') && material.function.includes('Stretch')) matches += 2;
    if (queryLower.includes('反光') && material.function.includes('Reflective')) matches += 2;
    if (queryLower.includes('耐磨') && material.function.includes('Abrasion Resistant')) matches += 2;
    if (queryLower.includes('回收') && material.function.includes('Eco-friendly')) matches += 2;
    if (queryLower.includes('柔軟') && material.function.includes('Soft')) matches += 2;

    return Math.min(1, 0.4 + matches * 0.15);
  }

  private computeColorScore(material: Material, targetColor: string): number {
    const matColors = material.color.map((c) => c.toLowerCase());
    const target = targetColor.toLowerCase();

    if (matColors.some((c) => c.includes(target) || target.includes(c))) {
      return 1.0;
    }
    return 0.35;
  }

  private deriveMatchReasons(
    material: Material,
    features: NormalizedSearchFeatures,
    targetColor: string,
    isIgnoreColor: boolean,
    quickTags: string[]
  ): MatchReasons {
    const high: string[] = [];
    const partial: string[] = [];
    const different: string[] = [];
    const inferred: string[] = [];

    // Check Structure
    for (const sc of features.structure_candidates) {
      const sVal = sc.value.toLowerCase();
      if (material.structure.some((s) => s.toLowerCase().includes(sVal))) {
        high.push(`${sc.value} 結構`);
      }
    }

    // Check Visual / Construction
    const matConst = material.construction.map((c) => c.toLowerCase());
    if (
      features.visual_features.some(
        (vf) => vf.toLowerCase().includes('mesh') || vf.toLowerCase().includes('網')
      ) &&
      matConst.some((c) => c.includes('mesh'))
    ) {
      high.push('Mesh 網孔特徵');
    }

    if (
      features.visual_features.some(
        (vf) => vf.toLowerCase().includes('jacquard') || vf.toLowerCase().includes('緹花')
      ) &&
      material.feature.some((f) => f.toLowerCase().includes('jacquard'))
    ) {
      high.push('Jacquard 緹花質感');
    }

    if (
      features.surface.texture &&
      matConst.some((c) => c.toLowerCase().includes(features.surface.texture.toLowerCase()))
    ) {
      high.push(`${features.surface.texture} 表面紋理`);
    }

    // Check Color
    if (!isIgnoreColor) {
      const matColors = material.color.map((c) => c.toLowerCase());
      if (matColors.some((c) => c.includes(targetColor.toLowerCase()))) {
        high.push(`${targetColor} 色系符合`);
      } else {
        different.push(`材料為 ${material.color.join('/')} (需求: ${targetColor})`);
      }
    }

    // Inferred functions (e.g. Breathable, Stretch, Soft)
    for (const pf of features.possible_functions) {
      const fVal = pf.value;
      if (material.function.some((mf) => mf.toLowerCase().includes(fVal.toLowerCase()))) {
        inferred.push(`${fVal} 為 AI 推測吻合`);
      }
    }

    // Quick tags check
    for (const tag of quickTags) {
      const tLower = tag.toLowerCase();
      if (tLower.includes('反光') && !material.function.includes('Reflective')) {
        if (!different.includes('無反光特性')) {
          different.push('無反光特性');
        }
      }
      if (tLower.includes('透氣') && material.function.includes('Breathable')) {
        if (!high.includes('透氣機能')) {
          high.push('透氣機能');
        }
      }
    }

    // Fallback if empty
    if (high.length === 0) {
      high.push('基礎織造結構接近');
    }

    return {
      high,
      partial,
      different,
      inferred,
    };
  }
}

export const materialSearchService = new MaterialSearchService();
