"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Calendar,
  Percent,
  DollarSign,
  Target,
  Tag,
  Package,
  CheckCircle,
  AlertCircle,
  Languages,
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";

export interface OfferFormInput {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applies_to: "all" | "category" | "product";
  category_id?: string | null;
  product_id?: string | null;
}

interface OfferFormProps {
  initialData?: Partial<OfferFormInput>;
  onSave: (data: OfferFormInput) => void;
  onCancel: () => void;
}

export function OfferForm({ initialData, onSave, onCancel }: OfferFormProps) {
  const t = useTranslations("offers");
  const locale = useLocale();

  const [form, setForm] = useState<OfferFormInput>({
    title_ar: initialData?.title_ar || "",
    title_en: initialData?.title_en || "",
    description_ar: initialData?.description_ar || "",
    description_en: initialData?.description_en || "",
    discount_type: initialData?.discount_type || "percentage",
    discount_value: initialData?.discount_value || 0,
    start_date:
      initialData?.start_date || new Date().toISOString().slice(0, 16),
    end_date:
      initialData?.end_date ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    is_active: initialData?.is_active ?? true,
    applies_to: initialData?.applies_to || "all",
    category_id: initialData?.category_id || null,
    product_id: initialData?.product_id || null,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof OfferFormInput, string>>
  >({});
  const { categories } = useCategories();
  const { products } = useProducts();

  const handleChange = (field: keyof OfferFormInput, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof OfferFormInput, string>> = {};

    if (!form.title_ar.trim())
      newErrors.title_ar = t("validation.titleRequired");
    if (!form.title_en.trim())
      newErrors.title_en = t("validation.titleRequired");
    if (!form.description_ar.trim())
      newErrors.description_ar = t("validation.descriptionRequired");
    if (!form.description_en.trim())
      newErrors.description_en = t("validation.descriptionRequired");
    if (form.discount_value <= 0)
      newErrors.discount_value = t("validation.discountValuePositive");
    if (form.discount_type === "percentage" && form.discount_value > 100) {
      newErrors.discount_value = t("validation.percentageMax");
    }
    if (new Date(form.start_date) >= new Date(form.end_date)) {
      newErrors.end_date = t("validation.endDateAfterStart");
    }
    if (form.applies_to === "category" && !form.category_id) {
      newErrors.category_id = t("validation.categoryRequired");
    }
    if (form.applies_to === "product" && !form.product_id) {
      newErrors.product_id = t("validation.productRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = { ...form };

    // Clean values based on offer type
    if (form.applies_to === "all") {
      payload.category_id = null;
      payload.product_id = null;
    } else if (form.applies_to === "category") {
      payload.product_id = null;
    } else if (form.applies_to === "product") {
      payload.category_id = null;
    }

    onSave(payload);
  };

  const getDiscountPreview = () => {
    if (form.discount_value > 0) {
      return form.discount_type === "percentage"
        ? t("discount.percentage", { value: form.discount_value })
        : t("discount.fixed", { value: form.discount_value });
    }
    return null;
  };

  const getAppliesText = () => {
    switch (form.applies_to) {
      case "all":
        return t("appliesTo.all");
      case "category":
        return t("appliesTo.category");
      case "product":
        return t("appliesTo.product");
      default:
        return "";
    }
  };

  // Get localized category name
  const getCategoryName = (category: any) => {
    return locale === "ar"
      ? category.name_ar || category.name
      : category.name_en || category.name;
  };

  // Get localized product name
  const getProductName = (product: any) => {
    return locale === "ar"
      ? product.name_ar || product.name
      : product.name_en || product.name;
  };

  // Get current title for preview
  const getCurrentTitle = () => {
    return locale === "ar" ? form.title_ar : form.title_en;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {initialData ? t("form.editTitle") : t("form.createTitle")}
            </h2>
            <p className="text-muted-foreground">{t("form.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            {form.is_active ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                {t("status.active")}
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {t("status.inactive")}
              </Badge>
            )}
            {getDiscountPreview() && (
              <Badge variant="outline" className="font-mono">
                {getDiscountPreview()}
              </Badge>
            )}
          </div>
        </div>
        <Separator />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                {t("sections.basicInfo.title")}
              </CardTitle>
              <CardDescription>
                {t("sections.basicInfo.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title_ar">
                    {t("fields.title.label")} (العربية) *
                  </Label>
                  <Input
                    id="title_ar"
                    placeholder={t("fields.title.placeholder")}
                    value={form.title_ar}
                    onChange={(e) => handleChange("title_ar", e.target.value)}
                    className={errors.title_ar ? "border-destructive" : ""}
                    dir="rtl"
                  />
                  {errors.title_ar && (
                    <p className="text-sm text-destructive">
                      {errors.title_ar}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title_en">
                    {t("fields.title.label")} (English) *
                  </Label>
                  <Input
                    id="title_en"
                    placeholder={t("fields.title.placeholder")}
                    value={form.title_en}
                    onChange={(e) => handleChange("title_en", e.target.value)}
                    className={errors.title_en ? "border-destructive" : ""}
                  />
                  {errors.title_en && (
                    <p className="text-sm text-destructive">
                      {errors.title_en}
                    </p>
                  )}
                </div>
              </div>

              {/* Description Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="description_ar">
                    {t("fields.description.label")} (العربية) *
                  </Label>
                  <Textarea
                    id="description_ar"
                    placeholder={t("fields.description.placeholder")}
                    value={form.description_ar}
                    onChange={(e) =>
                      handleChange("description_ar", e.target.value)
                    }
                    className={`min-h-[100px] resize-none ${
                      errors.description_ar ? "border-destructive" : ""
                    }`}
                    dir="rtl"
                  />
                  {errors.description_ar && (
                    <p className="text-sm text-destructive">
                      {errors.description_ar}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_en">
                    {t("fields.description.label")} (English) *
                  </Label>
                  <Textarea
                    id="description_en"
                    placeholder={t("fields.description.placeholder")}
                    value={form.description_en}
                    onChange={(e) =>
                      handleChange("description_en", e.target.value)
                    }
                    className={`min-h-[100px] resize-none ${
                      errors.description_en ? "border-destructive" : ""
                    }`}
                  />
                  {errors.description_en && (
                    <p className="text-sm text-destructive">
                      {errors.description_en}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discount Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                {t("sections.discountConfig.title")}
              </CardTitle>
              <CardDescription>
                {t("sections.discountConfig.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("fields.discountType.label")}</Label>
                  <Select
                    value={form.discount_type}
                    onValueChange={(val) => handleChange("discount_type", val)}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4" />
                          {t("fields.discountType.options.percentage")}
                        </div>
                      </SelectItem>
                      <SelectItem value="fixed">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {t("fields.discountType.options.fixed")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    {t("fields.discountValue.label")} *
                    {form.discount_type === "percentage" && (
                      <span className="text-muted-foreground"> (%)</span>
                    )}
                    {form.discount_type === "fixed" && (
                      <span className="text-muted-foreground">
                        {" "}
                        ({t("currency")})
                      </span>
                    )}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    min="0"
                    max={
                      form.discount_type === "percentage" ? "100" : undefined
                    }
                    step={form.discount_type === "percentage" ? "1" : "0.01"}
                    placeholder={
                      form.discount_type === "percentage" ? "20" : "100.00"
                    }
                    value={form.discount_value || ""}
                    onChange={(e) =>
                      handleChange(
                        "discount_value",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className={
                      errors.discount_value ? "border-destructive" : ""
                    }
                  />
                  {errors.discount_value && (
                    <p className="text-sm text-destructive">
                      {errors.discount_value}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t("sections.dateRange.title")}
              </CardTitle>
              <CardDescription>
                {t("sections.dateRange.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">
                    {t("fields.startDate.label")}
                  </Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={form.start_date}
                    onChange={(e) => handleChange("start_date", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">{t("fields.endDate.label")}</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(e) => handleChange("end_date", e.target.value)}
                    className={errors.end_date ? "border-destructive" : ""}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-destructive">
                      {errors.end_date}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t("sections.targetSettings.title")}
              </CardTitle>
              <CardDescription>
                {t("sections.targetSettings.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("fields.appliesTo.label")}</Label>
                <Select
                  value={form.applies_to}
                  onValueChange={(val) => handleChange("applies_to", val)}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {t("fields.appliesTo.options.all")}
                      </div>
                    </SelectItem>
                    <SelectItem value="category">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        {t("fields.appliesTo.options.category")}
                      </div>
                    </SelectItem>
                    <SelectItem value="product">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {t("fields.appliesTo.options.product")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.applies_to === "category" && (
                <div className="space-y-2">
                  <Label>{t("fields.category.label")}</Label>
                  <Select
                    value={form.category_id || ""}
                    onValueChange={(val) => handleChange("category_id", val)}
                  >
                    <SelectTrigger
                      className={errors.category_id ? "border-destructive" : ""}
                    >
                      <SelectValue
                        placeholder={t("fields.category.placeholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {getCategoryName(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && (
                    <p className="text-sm text-destructive">
                      {errors.category_id}
                    </p>
                  )}
                </div>
              )}

              {form.applies_to === "product" && (
                <div className="space-y-2">
                  <Label>{t("fields.product.label")}</Label>
                  <Select
                    value={form.product_id || ""}
                    onValueChange={(val) => handleChange("product_id", val)}
                  >
                    <SelectTrigger
                      className={errors.product_id ? "border-destructive" : ""}
                    >
                      <SelectValue
                        placeholder={t("fields.product.placeholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id}>
                          {getProductName(prod)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.product_id && (
                    <p className="text-sm text-destructive">
                      {errors.product_id}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Preview & Settings */}
        <div className="space-y-6">
          {/* Status Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("sections.status.title")}
              </CardTitle>
              <CardDescription>
                {t("sections.status.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="is_active" className="text-sm font-medium">
                    {t("fields.isActive.label")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {form.is_active
                      ? t("fields.isActive.activeHelp")
                      : t("fields.isActive.inactiveHelp")}
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(val) => handleChange("is_active", val)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Offer Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("sections.preview.title")}
              </CardTitle>
              <CardDescription>
                {t("sections.preview.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getCurrentTitle() && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("preview.title")}
                  </p>
                  <p
                    className="font-semibold"
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    {getCurrentTitle()}
                  </p>
                </div>
              )}

              {form.discount_value > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("preview.discount")}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {getDiscountPreview()}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("preview.appliesTo")}
                </p>
                <p className="font-medium">{getAppliesText()}</p>
              </div>

              {form.start_date && form.end_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("preview.period")}
                  </p>
                  <div className="text-sm space-y-1">
                    <p>
                      {t("preview.from")}:{" "}
                      {new Date(form.start_date).toLocaleDateString()}
                    </p>
                    <p>
                      {t("preview.to")}:{" "}
                      {new Date(form.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <Card dir={locale === "ar" ? "rtl" : "ltr"}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="min-w-[100px]"
            >
              {t("actions.cancel")}
            </Button>
            <Button onClick={handleSubmit} className="min-w-[100px]">
              {t("actions.save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
