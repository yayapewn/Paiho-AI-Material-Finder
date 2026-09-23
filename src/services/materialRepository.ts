import { Material, MaterialValidationResult } from '../types/material';
import defaultMaterials from '../../data/materials.json';

export interface MaterialDataProvider {
  getAllMaterials(): Material[];
  getMaterialById(id: string): Material | undefined;
  importMaterials(materials: Material[], mode?: 'append' | 'replace'): {
    importedCount: number;
    invalidCount: number;
    duplicateCount: number;
    errors: string[];
  };
  validateMaterial(material: unknown): MaterialValidationResult;
  resetToDefault(): void;
}

class MaterialRepository implements MaterialDataProvider {
  private materials: Material[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.materials = [...(defaultMaterials as Material[])];
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public getAllMaterials(): Material[] {
    return [...this.materials];
  }

  public getMaterialById(id: string): Material | undefined {
    return this.materials.find(
      (m) => m.id.trim().toLowerCase() === id.trim().toLowerCase()
    );
  }

  public validateMaterial(data: unknown): MaterialValidationResult {
    const errors: string[] = [];
    if (!data || typeof data !== 'object') {
      return { valid: false, errors: ['資料必須為有效的 JSON 物件'] };
    }

    const item = data as Record<string, unknown>;

    if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
      errors.push('缺少必填欄位: Material ID');
    }
    if (!item.name_zh || typeof item.name_zh !== 'string') {
      errors.push('缺少必填欄位: name_zh (中文名稱)');
    }
    if (!item.name_en || typeof item.name_en !== 'string') {
      errors.push('缺少必填欄位: name_en (英文名稱)');
    }
    if (!item.image_url || typeof item.image_url !== 'string') {
      errors.push('缺少欄位: image_url');
    }
    if (!item.official_url || typeof item.official_url !== 'string') {
      errors.push('缺少欄位: official_url');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public importMaterials(
    items: Material[],
    mode: 'append' | 'replace' = 'replace'
  ): {
    importedCount: number;
    invalidCount: number;
    duplicateCount: number;
    errors: string[];
  } {
    let importedCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];

    const existingIds = new Set(
      mode === 'replace' ? [] : this.materials.map((m) => m.id.toLowerCase())
    );
    const validItems: Material[] = [];

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const validation = this.validateMaterial(item);
      if (!validation.valid) {
        invalidCount++;
        errors.push(`第 ${index + 1} 筆 [${item?.id || '未知ID'}]: ${validation.errors.join(', ')}`);
        continue;
      }

      const lowerId = item.id.trim().toLowerCase();
      if (existingIds.has(lowerId)) {
        duplicateCount++;
        errors.push(`第 ${index + 1} 筆: Material ID "${item.id}" 重複已略過`);
        continue;
      }

      existingIds.add(lowerId);

      // Normalize array fields
      const normalized: Material = {
        ...item,
        id: item.id.trim(),
        product: Array.isArray(item.product) ? item.product : (item.product ? [String(item.product)] : []),
        structure: Array.isArray(item.structure) ? item.structure : (item.structure ? [String(item.structure)] : []),
        construction: Array.isArray(item.construction) ? item.construction : (item.construction ? [String(item.construction)] : []),
        feature: Array.isArray(item.feature) ? item.feature : (item.feature ? [String(item.feature)] : []),
        process: Array.isArray(item.process) ? item.process : (item.process ? [String(item.process)] : []),
        function: Array.isArray(item.function) ? item.function : (item.function ? [String(item.function)] : []),
        color: Array.isArray(item.color) ? item.color : (item.color ? [String(item.color)] : []),
        application: Array.isArray(item.application) ? item.application : (item.application ? [String(item.application)] : []),
        demo: item.demo ?? true,
      };

      validItems.push(normalized);
      importedCount++;
    }

    if (mode === 'replace') {
      if (validItems.length > 0) {
        this.materials = validItems;
      }
    } else {
      this.materials = [...this.materials, ...validItems];
    }

    this.notify();

    return {
      importedCount,
      invalidCount,
      duplicateCount,
      errors,
    };
  }

  public resetToDefault(): void {
    this.materials = [...(defaultMaterials as Material[])];
    this.notify();
  }
}

export const materialRepository = new MaterialRepository();
