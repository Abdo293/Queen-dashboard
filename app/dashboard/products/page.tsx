"use client";

import { useState } from "react";
import type { Product } from "@/types/products";
import { useProducts } from "@/hooks/useProducts";
import { ProductsHeader } from "@/components/products/products-header";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { ProductGrid } from "@/components/products/product-grid";
import { createClient } from "@/utils/supabase/client";

export default function ProductsPage() {
  const {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  } = useProducts();

  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);

  const handleAddClick = () => {
    setSelected(null);
    setIsEdit(false);
    setOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelected(product);
    setIsEdit(true);
    setOpen(true);
  };

  const handleFormSubmit = async (
    productData: any,
    mainImage: any,
    galleryImages: any[]
  ) => {
    const supabase = createClient();

    if (isEdit && selected) {
      // Handle product update
      const result = await updateProduct(selected.id, productData);
      if (!result.success) return;

      // Handle main image update for existing product
      if (mainImage) {
        const existingMain = selected.media?.find((m: any) => m.is_main);
        if (existingMain) {
          if (existingMain.public_id !== mainImage.public_id) {
            // احذف الصورة القديمة من Supabase
            await fetch("/api/media/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                supa_bucket: "media",
                supa_paths: [existingMain.public_id],
              }),
            });
          }
          // حدّث الريكورد الحالي
          await supabase
            .from("product_media")
            .update({
              file_url: mainImage.url,
              public_id: mainImage.public_id, // <-- ده لازم يكون path جوّه البكت
              file_type: mainImage.type,
            })
            .eq("id", existingMain.id);
        } else {
          // لو مفيش صورة أساسية قديمة، اعمل Insert جديدة
          await supabase.from("product_media").insert({
            product_id: selected.id,
            file_url: mainImage.url,
            file_type: mainImage.type,
            public_id: mainImage.public_id, // path
            is_main: true,
          });
        }
      }

      // Handle gallery images for existing product (add new ones)
      if (galleryImages.length > 0) {
        const galleryInserts = galleryImages.map((file) => ({
          product_id: selected.id,
          file_url: file.url,
          file_type: file.type,
          public_id: file.public_id,
          is_main: false,
        }));
        await supabase.from("product_media").insert(galleryInserts);
      }
    } else {
      // Handle new product creation
      const result = await addProduct(productData);
      if (!result.success) return;

      const newProductId = result.data.id;

      // Insert media for new product
      const mediaInserts = [];

      if (mainImage) {
        mediaInserts.push({
          product_id: newProductId,
          file_url: mainImage.url,
          file_type: mainImage.type,
          public_id: mainImage.public_id,
          is_main: true,
        });
      }

      // Add gallery images
      for (const file of galleryImages) {
        mediaInserts.push({
          product_id: newProductId,
          file_url: file.url,
          file_type: file.type,
          public_id: file.public_id,
          is_main: false,
        });
      }

      if (mediaInserts.length > 0) {
        await supabase.from("product_media").insert(mediaInserts);
      }
    }

    // Refresh products after all operations are complete
    refreshProducts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <ProductsHeader onAddClick={handleAddClick} />

        <ProductFormDialog
          open={open}
          onOpenChange={setOpen}
          isEdit={isEdit}
          selectedProduct={selected}
          onSubmit={handleFormSubmit}
        />

        <ProductGrid
          products={products}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteProduct}
          onAddClick={handleAddClick}
          onMediaUpdate={refreshProducts}
        />
      </div>
    </div>
  );
}
