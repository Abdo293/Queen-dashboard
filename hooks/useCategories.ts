// hooks/useCategories.ts
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Category, CategoryFormData } from "@/types/categories";

export function useCategories() {
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data || []);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add new category
  const addCategory = async (categoryData: CategoryFormData) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("categories")
        .insert({
          name_en: categoryData.name_en.trim(),
          name_ar: categoryData.name_ar.trim(),
          description_en: categoryData.description_en?.trim() || null,
          description_ar: categoryData.description_ar?.trim() || null,
          image_url: categoryData.image_url?.trim() || null,
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        throw error;
      }

      // Add the new category to the current state
      setCategories((prev) => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add category";
      setError(errorMessage);
      console.error("Error adding category:", err);
      return { success: false, error: errorMessage };
    }
  };

  // Update existing category
  const updateCategory = async (
    id: string,
    updates: Partial<CategoryFormData>
  ) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("categories")
        .update({
          ...updates,
          name_en: updates.name_en?.trim(),
          name_ar: updates.name_ar?.trim(),
          description_en: updates.description_en?.trim() || null,
          description_ar: updates.description_ar?.trim() || null,
          image_url: updates.image_url?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        setError(error.message);
        throw error;
      }

      // Update the category in the current state
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, ...data } : cat))
      );
      return { success: true, data };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update category";
      setError(errorMessage);
      console.error("Error updating category:", err);
      return { success: false, error: errorMessage };
    }
  };

  // Delete category
  const deleteCategory = async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) {
        return {
          success: false,
          error: { message: error.message, code: error.code },
        };
      }

      // Remove the category from the current state
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete category";
      setError(errorMessage);
      console.error("Error deleting category:", err);
      return { success: false, error: errorMessage };
    }
  };

  // Get category by ID
  const getCategoryById = (id: string): Category | undefined => {
    return categories.find((cat) => cat.id === id);
  };

  // Search and filter categories
  const getFilteredCategories = (locale: string = "en") => {
    if (!searchQuery.trim()) return categories;

    return categories.filter((category) => {
      const searchLower = searchQuery.toLowerCase().trim();

      // Safe access to properties with fallback to empty string
      const nameToSearch =
        locale === "ar"
          ? (category.name_ar || "").toLowerCase()
          : (category.name_en || "").toLowerCase();

      const descToSearch =
        locale === "ar"
          ? (category.description_ar || "").toLowerCase()
          : (category.description_en || "").toLowerCase();

      return (
        nameToSearch.includes(searchLower) || descToSearch.includes(searchLower)
      );
    });
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Refresh categories
  const refreshCategories = () => {
    fetchCategories();
  };

  // Get categories count
  const getCategoriesCount = () => {
    return categories.length;
  };

  // Check if category name exists
  const checkCategoryExists = (
    name_en: string,
    name_ar: string,
    excludeId?: string
  ) => {
    return categories.some(
      (cat) =>
        cat.id !== excludeId &&
        (cat.name_en.toLowerCase() === name_en.toLowerCase() ||
          cat.name_ar.toLowerCase() === name_ar.toLowerCase())
    );
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    // Data
    categories,
    loading,
    error,
    searchQuery,

    // CRUD Operations
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,

    // Search and Filter
    getFilteredCategories,
    setSearchQuery,
    clearSearch,

    // Utility Functions
    fetchCategories,
    refreshCategories,
    clearError,
    getCategoriesCount,
    checkCategoryExists,
  };
}
