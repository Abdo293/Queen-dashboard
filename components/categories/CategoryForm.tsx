// components/categories/CategoryForm.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type TFunc = (key: string, vars?: Record<string, any>) => string;

export function CategoryForm({
  isEdit,
  nameEn,
  nameAr,
  descEn,
  descAr,
  imageUrl,
  onNameEnChange,
  onNameArChange,
  onDescEnChange,
  onDescArChange,
  onImageUrlChange,
  onCancel,
  onSubmit,
  t,
}: {
  isEdit: boolean;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  imageUrl?: string | null;
  onNameEnChange: (v: string) => void;
  onNameArChange: (v: string) => void;
  onDescEnChange: (v: string) => void;
  onDescArChange: (v: string) => void;
  onImageUrlChange?: (v: string | null) => void;
  onCancel: () => void;
  onSubmit: () => void | Promise<void>;
  t: TFunc;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload/imgs", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Upload failed");
      }

      console.log("Upload successful:", json.url); // Debug log
      onImageUrlChange?.(json.url);
      toast.success(t("mediaDialog.setMain") || "Uploaded successfully");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // Function to ensure URL is secure
  const getSecureImageUrl = (url: string | null) => {
    if (!url) return null;
    return url.replace(/^http:/, "https:");
  };

  return (
    <div className="space-y-6">
      {/* Names */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("form.nameArabic")}</Label>
          <Input
            dir="rtl"
            value={nameAr}
            onChange={(e) => onNameArChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("form.nameEnglish")}</Label>
          <Input
            value={nameEn}
            onChange={(e) => onNameEnChange(e.target.value)}
          />
        </div>
      </div>

      {/* Description */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("form.descriptionArabic")}</Label>
          <Input
            dir="rtl"
            value={descAr}
            onChange={(e) => onDescArChange(e.target.value)}
            placeholder={t("form.descriptionArabicPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("form.descriptionEnglish")}</Label>
          <Input
            value={descEn}
            onChange={(e) => onDescEnChange(e.target.value)}
            placeholder={t("form.descriptionEnglishPlaceholder")}
          />
        </div>
      </div>

      <Separator />

      {/* Category Image */}
      <div className="space-y-3">
        <Label>الصورة</Label>
        <div className="flex items-center gap-3">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={uploading}
          />
          {imageUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onImageUrlChange?.(null)}
              disabled={uploading}
            >
              إزالة
            </Button>
          )}
        </div>

        {uploading && (
          <p className="text-sm text-blue-600">جاري رفع الصورة...</p>
        )}

        {imageUrl ? (
          <div className="relative h-32 w-32 overflow-hidden rounded-md ring-1 ring-blue-100">
            <Image
              src={getSecureImageUrl(imageUrl) || ""}
              alt="category preview"
              fill
              className="object-cover"
              onError={(e) => {
                console.error("Image load error:", e);
                console.error("Failed URL:", getSecureImageUrl(imageUrl));
                toast.error("Failed to load image");
              }}
              onLoad={() => {
                console.log("Image loaded successfully:", imageUrl);
              }}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            ارفع صورة اختيارية لتمييز القسم.
          </p>
        )}
      </div>

      <Separator />

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("actions.cancel")}
        </Button>
        <Button onClick={onSubmit} disabled={uploading}>
          {isEdit ? t("actions.update") : t("actions.save")}
        </Button>
      </div>
    </div>
  );
}
