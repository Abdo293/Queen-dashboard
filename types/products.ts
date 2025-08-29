export interface Product {
  id: string;
  name_en: string;
  name_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  type?: string | null;
  is_active: boolean;
  file_url?: string | null;
  category_id: string;
  quantity: number;
  price: number;
  created_at?: string;
  file_type: string;
  media: any;
  final_price: number;
  original_price: number;
  category: {
    id?: string;
    name_ar: string;
    name_en: string;
  };
}

export interface MediaItem {
  id: string;
  file_url: string;
  file_type: "image" | "video";
  public_id: string;
  is_main: boolean;
  created_at?: string;
}

export interface ProductMediaManagerProps {
  productId: string;
  media: MediaItem[];
  onMediaUpdate: () => void;
}
