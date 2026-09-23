export interface Material {
  id: string;
  name_zh: string;
  name_en: string;
  image_url: string;
  official_url: string;
  product: string[];
  structure: string[];
  construction: string[];
  feature: string[];
  process: string[];
  function: string[];
  color: string[];
  style?: string[];
  handfeel?: string[];
  composition?: string[];
  application: string[];
  sustainability?: string[];
  search_text?: string;
  visual_description?: string;
  demo: boolean;
}

export interface MaterialValidationResult {
  valid: boolean;
  errors: string[];
}
