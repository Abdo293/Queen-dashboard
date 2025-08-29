"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@/types/products";
import { useCategories } from "@/hooks/useCategories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Archive, Tag, ImageIcon, Activity } from "lucide-react";
import { MediaUploader } from "@/components/products/UploadMedia";
import { toast } from "sonner";
import { useProductTypes } from "@/hooks/useProductTypes";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  selectedProduct: Product | null;
  onSubmit: (
    productData: any,
    mainImage: any,
    galleryImages: any[]
  ) => Promise<void>;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  isEdit,
  selectedProduct,
  onSubmit,
}: ProductFormDialogProps) {
  const t = useTranslations("products");
  const locale = useLocale();
  const { categories } = useCategories();
  const { productTypes } = useProductTypes();

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [mainImage, setMainImage] = useState<{
    url: string;
    public_id: string;
    type: "image" | "video";
  } | null>(null);
  const [galleryImages, setGalleryImages] = useState<
    {
      url: string;
      public_id: string;
      type: "image" | "video";
    }[]
  >([]);

  const reset = () => {
    setNameEn("");
    setNameAr("");
    setDescEn("");
    setDescAr("");
    setPrice(0);
    setQuantity(1);
    setCategoryId("");
    setType("");
    setIsActive(true);
    setMainImage(null);
    setGalleryImages([]);
  };

  useEffect(() => {
    if (isEdit && selectedProduct) {
      setNameEn(selectedProduct.name_en);
      setNameAr(selectedProduct.name_ar);
      setDescEn(selectedProduct.description_en || "");
      setDescAr(selectedProduct.description_ar || "");
      setPrice(selectedProduct.price);
      setQuantity(selectedProduct.quantity);
      setCategoryId(selectedProduct.category_id);
      setType(selectedProduct.type || "");
      setIsActive(selectedProduct.is_active);
    } else {
      reset();
    }
  }, [isEdit, selectedProduct]);

  const handleSubmit = async () => {
    if (!isEdit && !mainImage) {
      toast.error(t("alerts.selectImg"));
      return;
    }

    const productData = {
      name_en: nameEn,
      name_ar: nameAr,
      description_en: descEn,
      description_ar: descAr,
      price,
      quantity,
      category_id: categoryId,
      type,
      is_active: isActive,
    };

    await onSubmit(productData, mainImage, galleryImages);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2 px-4">
            {isEdit ? t("actions.update") : t("actions.add")}
          </DialogTitle>
          <Separator />
        </DialogHeader>
        <div className="grid gap-6 py-6">
          {/* Product Names */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("form.name_ar")}
              </label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder={t("form.name_ar")}
                dir="rtl"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("form.name_en")}
              </label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder={t("form.name_en")}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("form.description_ar")}
              </label>
              <Textarea
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                placeholder={t("form.description_ar")}
                dir="rtl"
                rows={4}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("form.description_en")}
              </label>
              <Textarea
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                placeholder={t("form.description_en")}
                rows={4}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>

          {/* Price and Quantity */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t("form.price")}
              </label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder={t("form.price")}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Archive className="h-4 w-4" />
                {t("form.quantity")}
              </label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder={t("form.quantity")}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Category and Type */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {t("form.category")}
              </label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                dir={locale === "en" ? "ltr" : "rtl"}
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full">
                  <SelectValue placeholder={t("form.category")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem className="px-2" key={cat.id} value={cat.id}>
                      {locale === "ar" ? cat.name_ar : cat.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("form.type")}
              </label>
              <Select
                value={type}
                onValueChange={setType}
                dir={locale === "en" ? "ltr" : "rtl"}
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full">
                  <SelectValue placeholder={t("form.type")} />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((productType) => (
                    <SelectItem
                      className="px-2"
                      key={productType.id}
                      value={productType.id}
                    >
                      {locale === "ar"
                        ? productType.name_ar
                        : productType.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{t("form.active")}</span>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-green-500"
            />
          </div>

          {/* Main Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {t("form.mainImage")}
            </label>
            <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg">
              <MediaUploader
                onUploadComplete={(results) => {
                  if (results.length > 0) {
                    setMainImage(results[0]);
                  }
                }}
              />
            </div>
          </div>

          {/* Gallery Images */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {t("form.gallery")}
            </label>
            <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg">
              <MediaUploader
                onUploadComplete={(results) => {
                  setGalleryImages(results);
                }}
              />
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              {t("actions.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              className="px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isEdit ? t("actions.update") : t("actions.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
