"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { ProductType } from "@/types/product-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tag } from "lucide-react";
import { toast } from "sonner";

interface ProductTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  selectedProductType: ProductType | null;
  onSubmit: (data: {
    name_ar: string;
    name_en: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function ProductTypeFormDialog({
  open,
  onOpenChange,
  isEdit,
  selectedProductType,
  onSubmit,
}: ProductTypeFormDialogProps) {
  const t = useTranslations("productTypes");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setNameAr("");
    setNameEn("");
  };

  useEffect(() => {
    if (isEdit && selectedProductType) {
      setNameAr(selectedProductType.name_ar);
      setNameEn(selectedProductType.name_en);
    } else {
      reset();
    }
  }, [isEdit, selectedProductType, open]);

  const handleSubmit = async () => {
    if (!nameAr.trim() || !nameEn.trim()) {
      toast.error("Please fill in both Arabic and English names");
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit({
        name_ar: nameAr.trim(),
        name_en: nameEn.trim(),
      });

      if (result.success) {
        toast.success(
          isEdit
            ? "Product type updated successfully"
            : "Product type created successfully"
        );
        reset();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            {isEdit ? <>{t("editTypeTitle")}</> : <>{t("addTypeTitle")}</>}
          </DialogTitle>
          <Separator />
        </DialogHeader>

        <div className="grid gap-6 py-6">
          {/* Arabic Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t("arName")}
            </label>
            <Input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="اسم النوع بالعربية"
              dir="rtl"
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* English Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t("enName")}
            </label>
            <Input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Product type name in English"
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="px-6"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !nameAr.trim() || !nameEn.trim()}
              className="px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : isEdit ? (
                t("update")
              ) : (
                t("create")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
