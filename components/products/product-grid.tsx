"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Product } from "@/types/products";
import { EnhancedProductCard } from "./enhanced-product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Plus, Grid3X3 } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onAddClick: () => void;
  onMediaUpdate: () => void;
}

export function ProductGrid({
  products,
  loading,
  onEdit,
  onDelete,
  onAddClick,
  onMediaUpdate,
}: ProductGridProps) {
  const t = useTranslations("products");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState("all");

  // Group products by category
  const categorizedProducts = useMemo(() => {
    const categories = new Map();

    // Add "All" category
    categories.set("all", {
      id: "all",
      name_en: "All Products",
      name_ar: "جميع المنتجات",
      products: products,
      count: products.length,
    });

    // Group by actual categories
    products.forEach((product) => {
      if (product.category) {
        const categoryId = product.category.id;
        if (!categories.has(categoryId)) {
          categories.set(categoryId, {
            ...product.category,
            products: [],
            count: 0,
          });
        }
        categories.get(categoryId).products.push(product);
        categories.get(categoryId).count++;
      } else {
        // Handle products without category
        if (!categories.has("uncategorized")) {
          categories.set("uncategorized", {
            id: "uncategorized",
            name_en: "Uncategorized",
            name_ar: "غير مصنف",
            products: [],
            count: 0,
          });
        }
        categories.get("uncategorized").products.push(product);
        categories.get("uncategorized").count++;
      }
    });

    return Array.from(categories.values());
  }, [products]);

  if (products.length === 0 && !loading) {
    return (
      <div className="text-center py-20">
        <div className="p-4 bg-muted/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{t("noProducts")}</h3>
        <p className="text-muted-foreground mb-6">{t("startAdd")}</p>
        <Button
          onClick={onAddClick}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("actions.add")}
        </Button>
      </div>
    );
  }

  const renderProductGrid = (categoryProducts: Product[]) => {
    if (categoryProducts.length === 0) {
      return (
        <div className="text-center py-12">
          <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {locale === "ar"
              ? "لا توجد منتجات في هذه الفئة"
              : "No products in this category"}
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {categoryProducts.map((product) => (
          <EnhancedProductCard
            key={product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
            onMediaUpdate={onMediaUpdate}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2 bg-muted/50 px-2 rounded-lg mb-6">
          {categorizedProducts.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
            >
              <span className="font-medium">
                {locale === "ar" ? category.name_ar : category.name_en}
              </span>
              <Badge
                variant="secondary"
                className="ml-1 h-5 px-1.5 text-xs bg-primary/10 text-primary"
              >
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {categorizedProducts.map((category) => (
          <TabsContent
            key={category.id}
            value={category.id}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">
                  {locale === "ar" ? category.name_ar : category.name_en}
                </h3>
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20"
                >
                  {category.count} {locale === "ar" ? "منتج" : "products"}
                </Badge>
              </div>
            </div>
            {renderProductGrid(category.products)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
