"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "next-intl";
import { useCategories } from "@/hooks/useCategories";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  MoreVertical,
  Eye,
  Hash,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Category } from "@/types/categories";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { toast } from "sonner";
import Image from "next/image";

export default function CategoriesPage() {
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const t = useTranslations("categories");
  const locale = useLocale();

  const {
    loading,
    searchQuery,
    setSearchQuery,
    addCategory,
    updateCategory,
    deleteCategory,
    getFilteredCategories,
    clearError,
    checkCategoryExists,
  } = useCategories();

  const resetForm = () => {
    setNameEn("");
    setNameAr("");
    setDescEn("");
    setDescAr("");
    setImageUrl(null);
    setSelectedCategory(null);
  };

  const handleAdd = async () => {
    if (!nameEn.trim() || !nameAr.trim()) {
      console.log("Validation failed: missing names");
      return;
    }

    // Check if category already exists
    if (checkCategoryExists && checkCategoryExists(nameEn, nameAr)) {
      // You can show a toast or alert here
      toast.error(t("alerts.categoryExists"));
      return;
    }

    try {
      const result = await addCategory({
        name_en: nameEn,
        name_ar: nameAr,
        description_en: descEn,
        description_ar: descAr,
        image_url: imageUrl,
      });

      if (result && result.success) {
        resetForm();
        setImageUrl(null);
        setOpen(false);
      } else {
        console.error("Add failed:", result);
      }
    } catch (error) {
      console.error("Error in handleAdd:", error);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setNameEn(category.name_en || "");
    setNameAr(category.name_ar || "");
    setDescEn(category.description_en || "");
    setDescAr(category.description_ar || "");
    setImageUrl(category.image_url || null);
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedCategory || !nameEn.trim() || !nameAr.trim()) {
      console.log("Validation failed: missing data");
      return;
    }

    // Check if category name already exists (excluding current category)
    if (
      checkCategoryExists &&
      checkCategoryExists(nameEn, nameAr, selectedCategory.id)
    ) {
      console.log("Category name already exists");
      // You can show a toast or alert here
      toast.error(t("alerts.categoryExists"));
      return;
    }

    try {
      console.log("Calling updateCategory...");
      const result = await updateCategory(selectedCategory.id, {
        name_en: nameEn,
        name_ar: nameAr,
        description_en: descEn,
        description_ar: descAr,
        image_url: imageUrl,
      });

      console.log("Update result:", result);

      if (result && result.success) {
        resetForm();
        setImageUrl(null);
        setEditOpen(false);
      } else {
        console.error("Update failed:", result);
      }
    } catch (error) {
      console.error("Error in handleUpdate:", error);
    }
  };

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setViewOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    const result = await deleteCategory(categoryId);
    if (!result.success) {
      if (typeof result.error !== "string" && result.error?.code === "23503") {
        setError(t("categoryErrorLink"));
      } else {
        setError(t("faildToDelete"));
      }

      return;
    }
  };

  const handleCancel = (isEdit: boolean) => {
    resetForm();
    if (isEdit) {
      setEditOpen(false);
    } else {
      setOpen(false);
    }
  };

  const filteredCategories = getFilteredCategories(locale);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="h-auto p-1 text-destructive hover:text-destructive/80"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("actions.add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("dialogs.add.title")}</DialogTitle>
            </DialogHeader>
            <CategoryForm
              isEdit={false}
              nameEn={nameEn}
              nameAr={nameAr}
              descEn={descEn}
              descAr={descAr}
              imageUrl={imageUrl}
              onImageUrlChange={setImageUrl}
              onNameEnChange={setNameEn}
              onNameArChange={setNameAr}
              onDescEnChange={setDescEn}
              onDescArChange={setDescAr}
              onCancel={() => handleCancel(false)}
              onSubmit={handleAdd}
              t={t}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Hash className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">
                {searchQuery ? t("empty.noResults") : t("empty.noCategories")}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {searchQuery
                  ? t("empty.tryDifferentSearch")
                  : t("empty.createFirst")}
              </p>
              {!searchQuery && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 mt-4">
                      <Plus className="h-4 w-4" />
                      {t("actions.add")}
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className="group hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {locale === "ar" ? category.name_ar : category.name_en}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {locale === "ar"
                        ? category.description_ar || t("general.noDescription")
                        : category.description_en || t("general.noDescription")}
                    </CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(category)}>
                        <Eye className="h-4 w-4 mr-2" />
                        {t("actions.view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        {t("actions.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("actions.delete")}
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("dialogs.delete.title")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("dialogs.delete.description")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("actions.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t("actions.delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name_en}
                      width={400}
                      height={400}
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-muted rounded-md" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("dialogs.edit.title")}</DialogTitle>
          </DialogHeader>
          {/* Edit Dialog */}
          <CategoryForm
            isEdit={true}
            nameEn={nameEn}
            nameAr={nameAr}
            descEn={descEn}
            descAr={descAr}
            imageUrl={imageUrl} // أضِف دي
            onImageUrlChange={setImageUrl} // وأضِف دي
            onNameEnChange={setNameEn}
            onNameArChange={setNameAr}
            onDescEnChange={setDescEn}
            onDescArChange={setDescAr}
            onCancel={() => handleCancel(true)}
            onSubmit={handleUpdate}
            t={t}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("dialogs.view.title")}</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-6 py-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("form.nameArabic")}
                  </label>
                  <p className="text-lg font-medium" dir="rtl">
                    {selectedCategory.name_ar}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("form.nameEnglish")}
                  </label>
                  <p className="text-lg font-medium">
                    {selectedCategory.name_en}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("form.descriptionArabic")}
                  </label>
                  <p className="text-sm leading-relaxed" dir="rtl">
                    {selectedCategory.description_ar ||
                      t("general.noDescription")}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("form.descriptionEnglish")}
                  </label>
                  <p className="text-sm leading-relaxed">
                    {selectedCategory.description_en ||
                      t("general.noDescription")}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div className="space-y-1">
                  {selectedCategory.created_at && (
                    <p>
                      {t("general.createdAt")}:{" "}
                      {new Date(selectedCategory.created_at).toLocaleString(
                        locale
                      )}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewOpen(false);
                    handleEdit(selectedCategory);
                  }}
                  className="gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  {t("actions.edit")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
