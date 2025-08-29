"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@/types/products";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit3, DollarSign, ImageIcon } from "lucide-react";
import { ProductMediaManager } from "./product-media-manager";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface EnhancedProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onMediaUpdate: () => void;
}

export function EnhancedProductCard({
  product,
  onEdit,
  onDelete,
  onMediaUpdate,
}: EnhancedProductCardProps) {
  const t = useTranslations("products");
  const locale = useLocale();
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

  const mainImage = product.media?.find((m: any) => m.is_main);
  const allImages =
    product.media?.filter((m: any) => m.file_type === "image") || [];

  return (
    <>
      <Card className="group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
        {/* Media Section */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40">
          {mainImage ? (
            <img
              src={mainImage.file_url || "/placeholder.svg"}
              alt="Product"
              className="w-full h-full object-cover"
            />
          ) : allImages.length > 0 ? (
            <img
              src={allImages[0].file_url || "/placeholder.svg"}
              alt="Product"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Status and Media Count Badges */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge
              variant={product.is_active ? "default" : "secondary"}
              className={`${
                product.is_active
                  ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30"
                  : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30"
              } backdrop-blur-sm font-medium`}
            >
              {product.is_active ? "Active" : "Inactive"}
            </Badge>
            {product.media && product.media.length > 0 && (
              <Badge
                variant="outline"
                className="backdrop-blur-sm bg-white/90 text-gray-700 border-gray-300 dark:bg-gray-800/90 dark:text-gray-300 dark:border-gray-600 font-medium"
              >
                {product.media.length} {t("actions.media")}
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors duration-200">
              {locale === "ar" ? product.name_ar : product.name_en}
            </CardTitle>
            <Badge
              variant="outline"
              className="shrink-0 capitalize bg-primary/5 text-primary border-primary/20"
            >
              <p className="text-sm text-muted-foreground">
                {locale === "ar"
                  ? product.category?.name_ar
                  : product.category?.name_en}
              </p>
            </Badge>
          </div>
          <CardDescription className="text-sm leading-relaxed line-clamp-2">
            {locale === "ar" ? product.description_ar : product.description_en}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Price and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("form.price")}
                </p>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-green-600 flex items-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    {product.final_price}
                  </p>
                  {product.final_price !== product.original_price && (
                    <span className="line-through text-gray-400 ml-2 flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      {product.original_price}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("form.quantity")}
                </p>
                <p className="font-semibold text-blue-600">
                  {product.quantity}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(product)}
              className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              {t("actions.edit")}
            </Button>

            <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200 bg-transparent"
                >
                  <ImageIcon className="h-3 w-3 mr-1" />
                  {t("actions.media")}
                </Button>
              </DialogTrigger>
              <DialogContent className="!max-w-none max-h-none !w-[95vw] h-[95vh] overflow-y-auto p-8">
                <DialogHeader className="mb-6">
                  <DialogTitle className="flex items-center gap-3 text-2xl">
                    <ImageIcon className="h-6 w-6" />
                    {t("mediaDialog.title")}
                  </DialogTitle>
                </DialogHeader>
                <ProductMediaManager
                  productId={product.id}
                  media={product.media || []}
                  onMediaUpdate={() => {
                    onMediaUpdate();
                    setMediaDialogOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  {t("actions.delete")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("alerts.deleteSureMessage")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("alerts.noBack")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("alerts.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(product.id)}
                    className="bg-red-500 hover:bg-red-700"
                  >
                    {t("alerts.deleteSure")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
