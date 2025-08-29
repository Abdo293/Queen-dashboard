"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Product } from "@/types/products";
import { OfferFormInput } from "@/components/offers/OfferForm";

type EnrichedProduct = Product & {
  type_name_en?: string | null;
  type_name_ar?: string | null;
  media?: any[];
  final_price?: number;
  original_price?: number;
  applied_offer?: OfferFormInput | null;
};

export function useProducts() {
  const supabase = createClient();
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);

    // 1) المنتجات
    const { data: productsData, error: productError } = await supabase
      .from("products")
      .select("*, category:categories(id, name_en, name_ar)")
      .order("created_at", { ascending: false });

    if (productError) {
      console.error("Error fetching products:", productError.message);
      setError(productError.message);
      setLoading(false);
      return;
    }

    // 2) العروض الفعّالة
    const { data: offersData, error: offersError } = await supabase
      .from("offers")
      .select("*")
      .eq("is_active", true);

    if (offersError) {
      console.error("Error fetching offers:", offersError.message);
      setError(offersError.message);
      setLoading(false);
      return;
    }

    // 3) أنواع المنتجات (نحتاج الاسم بدل الرقم)
    const { data: typesData, error: typesError } = await supabase
      .from("product_type")
      .select("id, name_en, name_ar");

    if (typesError) {
      console.error("Error fetching product_type:", typesError.message);
      setError(typesError.message);
      setLoading(false);
      return;
    }

    // 4) إثراء كل منتج بالميديا + خصم السعر + اسم النوع
    const enrichedProducts = await Promise.all(
      (productsData || []).map(async (product) => {
        // الميديا
        const { data: media } = await supabase
          .from("product_media")
          .select("*")
          .eq("product_id", product.id);

        // العرض المناسب
        const now = new Date();
        const offer = (offersData || []).find((offer: OfferFormInput) => {
          const start = new Date(offer.start_date);
          const end = new Date(offer.end_date);
          const inDateRange = now >= start && now <= end;

          const matchProduct =
            offer.applies_to === "product" && offer.product_id === product.id;

          const matchCategory =
            offer.applies_to === "category" &&
            offer.category_id === product.category_id;

          return inDateRange && (matchProduct || matchCategory);
        });

        // حساب السعر النهائي
        let final_price = product.price;
        if (offer) {
          if (offer.discount_type === "percentage") {
            final_price =
              product.price - (product.price * offer.discount_value) / 100;
          } else if (offer.discount_type === "fixed") {
            final_price = product.price - offer.discount_value;
          }
          if (final_price < 0) final_price = 0;
        }

        // مطابقة النوع (product.type يحمل الـ id)
        const matchedType = (typesData || []).find(
          (t: any) => String(t.id) === String((product as any).type)
        );

        return {
          ...product,
          media: media || [],
          final_price,
          original_price: product.price,
          applied_offer: offer || null,
          type_name_en: matchedType?.name_en ?? null,
          type_name_ar: matchedType?.name_ar ?? null,
        } as EnrichedProduct;
      })
    );

    setProducts(enrichedProducts);
    setLoading(false);
  };

  const addProduct = async (productData: Partial<Product>) => {
    const { data, error } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (error) return { success: false, error };
    return { success: true, data };
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error };
    return { success: true, data };
  };

  // حذف المنتج + وسائطه (نسخة Supabase فقط)
  const deleteProductWithMedia = async (productId: string) => {
    try {
      await supabase.from("offers").delete().eq("product_id", productId);

      const { data: mediaItems, error: fetchError } = await supabase
        .from("product_media")
        .select("*")
        .eq("product_id", productId);

      if (fetchError) throw fetchError;

      const supa_paths: string[] = [];
      const supa_urls: string[] = [];

      if (Array.isArray(mediaItems) && mediaItems.length > 0) {
        for (const m of mediaItems) {
          const pid = String(m.public_id || "").trim();
          if (!pid) continue;
          if (/^https?:\/\//i.test(pid)) supa_urls.push(pid);
          else supa_paths.push(pid.replace(/^\/+/, ""));
        }

        if (supa_urls.length || supa_paths.length) {
          const payload = supa_urls.length
            ? { supa_urls }
            : { supa_bucket: "media", supa_paths };

          const delRes = await fetch("/api/media/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const delJson = await delRes.json();
          if (!delRes.ok || delJson?.success === false) {
            console.error("Supabase delete failed:", delJson);
          }
        }
      }

      await supabase.from("product_media").delete().eq("product_id", productId);

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      return { success: true };
    } catch (error) {
      console.error("[DELETE_PRODUCT_WITH_MEDIA_ERROR]", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "فشل في حذف المنتج أو الوسائط.",
      };
    }
  };

  const refreshProducts = () => fetchProducts();

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct: deleteProductWithMedia,
    refreshProducts,
  };
}
