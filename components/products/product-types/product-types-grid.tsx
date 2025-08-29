"use client";

import type { ProductType } from "@/types/product-types";
import { ProductTypeCard } from "./product-type-card";
import { Button } from "@/components/ui/button";
import { Tag, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProductTypesGridProps {
  productTypes: ProductType[];
  loading: boolean;
  onEdit: (productType: ProductType) => void;
  onDelete: (productTypeId: string) => void;
  onAddClick: () => void;
}

export function ProductTypesGrid({
  productTypes,
  loading,
  onEdit,
  onDelete,
  onAddClick,
}: ProductTypesGridProps) {
  if (productTypes.length === 0 && !loading) {
    const t = useTranslations("productTypes");
    return (
      <div className="text-center py-20">
        <div className="p-4 bg-muted/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Tag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{t("noTypes")}</h3>
        <p className="text-muted-foreground mb-6">{t("startAdd")}</p>
        <Button
          onClick={onAddClick}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("addType")}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {productTypes.map((productType) => (
        <ProductTypeCard
          key={productType.id}
          productType={productType}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
