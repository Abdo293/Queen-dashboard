export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryFormData {
  id?: string;
  name_en: string;
  name_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  image_url: string | null;
}

export interface CategoryFormProps {
  isEdit?: boolean;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  onNameEnChange: (value: string) => void;
  onNameArChange: (value: string) => void;
  onDescEnChange: (value: string) => void;
  onDescArChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  t: any;
}
