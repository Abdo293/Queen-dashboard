export interface ProductType {
  id: string;
  created_at?: string;
  name_ar: string;
  name_en: string;
}

export interface CreateProductTypeData {
  name_ar: string;
  name_en: string;
}

export interface UpdateProductTypeData {
  name_ar?: string;
  name_en?: string;
}
