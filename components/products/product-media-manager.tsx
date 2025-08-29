"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Trash2,
  Star,
  StarOff,
  Plus,
  ImageIcon,
  Video,
  Play,
  Eye,
} from "lucide-react";
import { MediaUploader } from "@/components/products/UploadMedia";
import { MediaPreviewModal } from "./media-preview-modal";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import type { MediaItem, ProductMediaManagerProps } from "@/types/products";

export function ProductMediaManager({
  productId,
  media,
  onMediaUpdate,
}: ProductMediaManagerProps) {
  const t = useTranslations("products");
  const supabase = createClient();
  const [showUploader, setShowUploader] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    media: MediaItem[];
    initialIndex: number;
  }>({
    isOpen: false,
    media: [],
    initialIndex: 0,
  });

  const locale = useLocale();

  const images = media.filter((item) => item.file_type === "image");
  const videos = media.filter((item) => item.file_type === "video");

  const handleDeleteMedia = async (mediaItem: MediaItem) => {
    try {
      // First delete from Cloudinary to ensure we don't have orphaned files
      const deleteResponse = await fetch("/api/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supa_bucket: "media",
          supa_paths: [mediaItem.public_id],
        }),
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || "Failed to delete from Cloudinary");
      }

      // Then delete from database
      const { error } = await supabase
        .from("product_media")
        .delete()
        .eq("id", mediaItem.id);

      if (error) throw error;

      toast.success(t("mediaDialog.deleteSuccess"));
      onMediaUpdate();
    } catch (error) {
      console.error("[DELETE_MEDIA_ERROR]", error);
      toast.error(
        error instanceof Error ? error.message : t("mediaDialog.deleteFailed")
      );
    }
  };

  const handleSetMainImage = async (mediaItem: MediaItem) => {
    try {
      // First, set all media for this product to not main
      await supabase
        .from("product_media")
        .update({ is_main: false })
        .eq("product_id", productId);

      // Then set the selected media as main
      const { error } = await supabase
        .from("product_media")
        .update({ is_main: true })
        .eq("id", mediaItem.id);

      if (error) throw error;

      toast.success("Main image updated successfully");
      onMediaUpdate();
    } catch (error) {
      console.error("Error setting main image:", error);
      toast.error("Failed to set main image");
    }
  };

  const handleAddMedia = async (uploadedFiles: any[]) => {
    if (!uploadedFiles.length) return;

    setUploading(true);
    try {
      const inserts = uploadedFiles.map((file) => ({
        product_id: productId,
        file_url: file.url,
        file_type: file.type,
        public_id: file.public_id,
        is_main: false,
      }));

      const { error } = await supabase.from("product_media").insert(inserts);

      if (error) throw error;

      toast.success("Media added successfully");
      setShowUploader(false);
      onMediaUpdate();
    } catch (error) {
      console.error("Error adding media:", error);
      toast.error("Failed to add media");
    } finally {
      setUploading(false);
    }
  };

  const openPreview = (mediaList: MediaItem[], clickedItem: MediaItem) => {
    // Find the correct index of the clicked item in the media list
    const correctIndex = mediaList.findIndex(
      (item) => item.id === clickedItem.id
    );

    setPreviewModal({
      isOpen: true,
      media: mediaList,
      initialIndex: correctIndex >= 0 ? correctIndex : 0,
    });
  };

  const MediaGrid = ({
    items,
  }: {
    items: MediaItem[];
    type: "image" | "video";
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
      {items.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20"
        >
          <CardContent className="p-0">
            {/* Media Display */}
            <div className="relative aspect-video bg-gray-100">
              {item.file_type === "image" ? (
                <div className="relative w-full h-full">
                  <img
                    src={item.file_url || "/placeholder.svg"}
                    alt="Product media"
                    className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => openPreview(images, item)}
                  />
                  {/* Preview Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => openPreview(images, item)}
                      className="gap-2 bg-white/95 text-gray-900 hover:bg-white shadow-lg"
                    >
                      <Eye className="h-5 w-5" />
                      {t("mediaDialog.view")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full bg-gray-900 flex items-center justify-center cursor-pointer group">
                  <video
                    src={item.file_url}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                    poster={`${item.file_url}#t=1`}
                  />
                  {/* Video Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-all duration-300">
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => openPreview(videos, item)}
                      className="gap-3 bg-white/95 text-gray-900 hover:bg-white group-hover:scale-110 transition-all shadow-lg px-6 py-3"
                    >
                      <Play className="h-6 w-6" />
                      {t("mediaDialog.playVideo")}
                    </Button>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="secondary"
                      className="bg-black/80 text-white border-0"
                    >
                      <Video className="h-3 w-3 mr-1" />
                      {t("mediaDialog.video")}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Main Image Badge */}
              {item.is_main && (
                <Badge className="absolute top-3 left-3 bg-yellow-500 text-yellow-900 shadow-lg border-0">
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  {t("mediaDialog.main")}
                </Badge>
              )}
            </div>

            {/* Action Buttons Section */}
            <div className="p-6 space-y-4">
              {/* Media Info */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold capitalize text-base">
                  {item.file_type}
                </span>
                <span className="text-muted-foreground">
                  {new Date(item.created_at || "").toLocaleDateString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="default"
                  variant="outline"
                  onClick={() => handleSetMainImage(item)}
                  disabled={item.is_main || item.file_type === "video"}
                  className="gap-2 hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700 disabled:opacity-50 h-10"
                >
                  {item.is_main ? (
                    <Star className="h-4 w-4 fill-current" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                  {item.is_main
                    ? `${t("mediaDialog.main")}`
                    : `${t("mediaDialog.setMain")}`}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="default"
                      variant="outline"
                      className="gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 bg-transparent h-10"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("actions.delete")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("mediaDialog.deleteMedia")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("mediaDialog.deleteConfirmation", {
                          type: item.file_type,
                        })}
                        {item.is_main && (
                          <span className="block mt-2 text-yellow-600 font-medium">
                            ⚠️ {t("mediaDialog.mainImageWarning")}
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {t("actions.cancel")}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteMedia(item)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {t("actions.delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Main Image Indicator */}
              {item.is_main && (
                <div className="text-center">
                  <span className="text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-full">
                    {t("mediaDialog.displayOnCard")}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          {/* <h3 className="text-3xl font-bold flex items-center gap-4">
            <ImageIcon className="h-8 w-8" />
            {t("mediaDialog.title")} ({media.length})
          </h3> */}
          <Button
            variant="outline"
            onClick={() => setShowUploader(!showUploader)}
            className="gap-2 px-6 py-3"
          >
            <Plus className="h-5 w-5" />
            {t("mediaDialog.addMedia")}
          </Button>
        </div>

        {/* Media Upload Section */}
        {showUploader && (
          <Card className="border-dashed border-2">
            <CardContent className="p-8">
              <MediaUploader
                onUploadComplete={handleAddMedia}
                disabled={uploading}
              />
              {uploading && (
                <div className="text-center text-sm text-muted-foreground mt-4">
                  {t("mediaDialog.uploadMedia")}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Media Tabs */}
        {media.length > 0 ? (
          <Tabs
            defaultValue="images"
            className="w-full"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
              <TabsTrigger value="images" className="gap-2 text-base">
                <ImageIcon className="h-5 w-5" />
                {t("mediaDialog.images")} ({images.length})
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2 text-base">
                <Video className="h-5 w-5" />
                {t("mediaDialog.videos")} ({videos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="space-y-6">
              {images.length > 0 ? (
                <MediaGrid items={images} type="image" />
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <ImageIcon className="h-20 w-20 mx-auto mb-6 opacity-50" />
                  <h4 className="text-xl font-medium mb-3">
                    {t("mediaDialog.noImgs")}
                  </h4>
                  <p className="text-base">{t("mediaDialog.uploadSomeImgs")}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
              {videos.length > 0 ? (
                <MediaGrid items={videos} type="video" />
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Video className="h-20 w-20 mx-auto mb-6 opacity-50" />
                  <h4 className="text-xl font-medium mb-3">
                    {t("mediaDialog.noVideo")}
                  </h4>
                  <p className="text-base">
                    {t("mediaDialog.uploadSomeVideos")}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <ImageIcon className="h-24 w-24 mx-auto mb-6 opacity-50" />
            <h4 className="text-2xl font-medium mb-3">
              {t("mediaDialog.noMedia")}
            </h4>
            <p className="text-lg">{t("mediaDialog.mediaAddAction")}</p>
          </div>
        )}
      </div>

      {/* Media Preview Modal */}
      <MediaPreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ ...previewModal, isOpen: false })}
        media={previewModal.media}
        initialIndex={previewModal.initialIndex}
      />
    </>
  );
}
