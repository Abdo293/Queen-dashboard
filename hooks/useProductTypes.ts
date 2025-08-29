"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type {
  ProductType,
  CreateProductTypeData,
  UpdateProductTypeData,
} from "@/types/product-types";

export function useProductTypes() {
  const supabase = createClient();
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("product_type")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProductTypes(data || []);
    } catch (err) {
      console.error("Error fetching product types:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch product types"
      );
    } finally {
      setLoading(false);
    }
  };

  const addProductType = async (productTypeData: CreateProductTypeData) => {
    try {
      const { data, error } = await supabase
        .from("product_type")
        .insert(productTypeData)
        .select()
        .single();

      if (error) throw error;

      setProductTypes((prev) => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      console.error("Error adding product type:", err);
      return {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to add product type",
      };
    }
  };

  const updateProductType = async (
    id: string,
    productTypeData: UpdateProductTypeData
  ) => {
    try {
      const { data, error } = await supabase
        .from("product_type")
        .update(productTypeData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setProductTypes((prev) =>
        prev.map((type) => (type.id === id ? data : type))
      );
      return { success: true, data };
    } catch (err) {
      console.error("Error updating product type:", err);
      return {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to update product type",
      };
    }
  };

  const deleteProductType = async (id: string) => {
    try {
      // First check if any products are using this type
      const { data: productsUsingType, error: checkError } = await supabase
        .from("products")
        .select("id")
        .eq("type", id)
        .limit(1);

      if (checkError) throw checkError;

      if (productsUsingType && productsUsingType.length > 0) {
        return {
          success: false,
          error: "Cannot delete product type that is being used by products",
        };
      }

      const { error } = await supabase
        .from("product_type")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setProductTypes((prev) => prev.filter((type) => type.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Error deleting product type:", err);
      return {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to delete product type",
      };
    }
  };

  const refreshProductTypes = () => {
    fetchProductTypes();
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  return {
    productTypes,
    loading,
    error,
    addProductType,
    updateProductType,
    deleteProductType,
    refreshProductTypes,
  };
}
