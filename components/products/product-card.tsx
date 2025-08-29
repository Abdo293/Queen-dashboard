"use client";

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
import { Calendar, Edit3, DollarSign, Archive } from "lucide-react";
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

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const t = useTranslations("products");
  const locale = useLocale();

  return (
    <Card className="group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      {/* Media Section */}
      {product.media && product.media.length > 0 && (
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40">
          <img
            src={product.media[0].file_url || "/placeholder.svg"}
            alt="..."
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <Badge
              variant={product.is_active ? "default" : "secondary"}
              className={`${
                product.is_active
                  ? "bg-green-500/20 text-green-700 dark:text-green-400"
                  : "bg-gray-500/20"
              } backdrop-blur-sm`}
            >
              {product.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors duration-200">
            {locale === "ar" ? product.name_ar : product.name_en}
          </CardTitle>
          <Badge
            variant="outline"
            className="shrink-0 capitalize bg-primary/5 text-primary border-primary/20"
          >
            {product.type}
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
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">{t("form.price")}</p>
              <p className="font-semibold text-green-600">{product.price}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <Archive className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t("form.quantity")}
              </p>
              <p className="font-semibold text-blue-600">{product.quantity}</p>
            </div>
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(product.created_at || "").toLocaleString(locale)}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(product)}
            className="flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            {t("actions.edit")}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" className="flex-1">
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
  );
}
