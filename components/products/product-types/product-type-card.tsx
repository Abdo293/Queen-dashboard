"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ProductType } from "@/types/product-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Edit3, Tag } from "lucide-react";
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

interface ProductTypeCardProps {
  productType: ProductType;
  onEdit: (productType: ProductType) => void;
  onDelete: (productTypeId: string) => void;
}

export function ProductTypeCard({
  productType,
  onEdit,
  onDelete,
}: ProductTypeCardProps) {
  const locale = useLocale();
  const t = useTranslations("productTypes");

  return (
    <Card className="group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Tag className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors duration-200">
            {locale === "ar" ? productType.name_ar : productType.name_en}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Names Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("arabic")}:
            </span>
            <span className="font-medium" dir="rtl">
              {productType.name_ar}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("english")}:
            </span>
            <span className="font-medium">{productType.name_en}</span>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(productType)}
            className="flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            {t("edit")}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" className="flex-1">
                {t("delete")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("confirmDeleteMessage")} "
                  {locale === "ar" ? productType.name_ar : productType.name_en}
                  ".
                  <br />
                  <br />
                  <strong>{t("note")}:</strong> {t("deleteNote")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(productType.id)}
                  className="bg-red-500 hover:bg-red-700"
                >
                  {t("delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
