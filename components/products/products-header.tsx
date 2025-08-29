"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";

interface ProductsHeaderProps {
  onAddClick: () => void;
}

export function ProductsHeader({ onAddClick }: ProductsHeaderProps) {
  const t = useTranslations("products");

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Package className="h-8 w-8 text-primary" />
          </div>
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg">{t("description")}</p>
      </div>
      <Button
        size="lg"
        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
        onClick={onAddClick}
      >
        <Plus className="h-5 w-5" />
        {t("actions.add")}
      </Button>
    </div>
  );
}
