"use client";

import { useState } from "react";
import type { ProductType } from "@/types/product-types";
import { Button } from "@/components/ui/button";
import { Plus, Tag } from "lucide-react";
import { toast } from "sonner";
import { useProductTypes } from "@/hooks/useProductTypes";
import { ProductTypeFormDialog } from "@/components/products/product-types/product-type-form-dialog";
import { ProductTypesGrid } from "@/components/products/product-types/product-types-grid";
import { useTranslations } from "next-intl";

export default function ProductTypesPage() {
  const {
    productTypes,
    loading,
    addProductType,
    updateProductType,
    deleteProductType,
  } = useProductTypes();

  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState<ProductType | null>(null);
  const t = useTranslations("productTypes");

  const handleAddClick = () => {
    setSelected(null);
    setIsEdit(false);
    setOpen(true);
  };

  const handleEdit = (productType: ProductType) => {
    setSelected(productType);
    setIsEdit(true);
    setOpen(true);
  };

  const handleFormSubmit = async (data: {
    name_ar: string;
    name_en: string;
  }) => {
    if (isEdit && selected) {
      console.log("Sending category_id:", selected.id);
      return await updateProductType(selected.id, data);
    } else {
      return await addProductType(data);
    }
  };

  const handleDelete = async (productTypeId: string) => {
    const result = await deleteProductType(productTypeId);
    if (result.success) {
      toast.success("Product type deleted successfully");
    } else {
      toast.error(result.error || "Failed to delete product type");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Tag className="h-8 w-8 text-primary" />
              </div>
              {t("productTypes")}
            </h1>
            <p className="text-muted-foreground text-lg">{t("manageTypes")}</p>
          </div>
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
            onClick={handleAddClick}
          >
            <Plus className="h-5 w-5" />
            {t("addType")}
          </Button>
        </div>

        {/* Form Dialog */}
        <ProductTypeFormDialog
          open={open}
          onOpenChange={setOpen}
          isEdit={isEdit}
          selectedProductType={selected}
          onSubmit={handleFormSubmit}
        />

        {/* Grid */}
        <ProductTypesGrid
          productTypes={productTypes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddClick={handleAddClick}
        />
      </div>
    </div>
  );
}
