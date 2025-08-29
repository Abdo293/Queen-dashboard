"use client";

import type React from "react";

import { useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/supabaseStorage";
import { Button } from "@/components/ui/button";
import {
  Upload,
  X,
  ImageIcon,
  Video,
  File,
  Check,
  Trash2,
  CloudUpload,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  file: File;
  result: {
    url: string;
    public_id: string;
    type: "image" | "video";
  };
  status: "uploading" | "completed" | "error";
  progress: number;
}

export function MediaUploader({
  onUploadComplete,
  disabled = false,
}: {
  onUploadComplete: (
    results: {
      url: string;
      public_id: string;
      type: "image" | "video";
    }[]
  ) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    // Add files to the uploaded files list with initial state
    const newFiles: UploadedFile[] = files.map((file) => ({
      file,
      result: {
        url: "",
        public_id: "",
        type: file.type.startsWith("image/") ? "image" : "video",
      },
      status: "uploading",
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    try {
      const uploadedResults = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileIndex = uploadedFiles.length + i;

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadedFiles((prev) => {
            const updated = [...prev];
            if (
              updated[fileIndex] &&
              updated[fileIndex].status === "uploading"
            ) {
              const currentProgress = updated[fileIndex].progress;
              if (currentProgress < 90) {
                updated[fileIndex].progress = Math.min(
                  90,
                  currentProgress + Math.random() * 20
                );
              }
            }
            return updated;
          });
        }, 200);

        try {
          const result = await uploadToCloudinary(file);
          clearInterval(progressInterval);

          // Update the file status to completed
          setUploadedFiles((prev) => {
            const updated = [...prev];
            if (updated[fileIndex]) {
              updated[fileIndex] = {
                ...updated[fileIndex],
                result,
                status: "completed",
                progress: 100,
              };
            }
            return updated;
          });

          uploadedResults.push(result);
        } catch (error) {
          clearInterval(progressInterval);
          // Update the file status to error
          setUploadedFiles((prev) => {
            const updated = [...prev];
            if (updated[fileIndex]) {
              updated[fileIndex].status = "error";
            }
            return updated;
          });
          console.error("Upload error for file:", file.name, error);
        }
      }

      // Call the callback with successfully uploaded files
      if (uploadedResults.length > 0) {
        onUploadComplete(uploadedResults);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    await handleFiles(Array.from(files));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/"))
      return <ImageIcon className="w-4 h-4" />;
    if (file.type.startsWith("video/")) return <Video className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        );
      case "error":
        return <X className="w-4 h-4 text-red-500 dark:text-red-400" />;
      default:
        return (
          <div className="w-4 h-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
        );
    }
  };

  const completedFiles = uploadedFiles.filter((f) => f.status === "completed");
  const uploadingFiles = uploadedFiles.filter((f) => f.status === "uploading");

  return (
    <div className="w-full space-y-8">
      {/* Drop Zone */}
      <div
        className={cn(
          "relative group overflow-hidden",
          "border-2 border-dashed rounded-2xl p-10 text-center",
          "transition-all duration-500 cursor-pointer",
          "bg-gradient-to-br from-background to-muted/30",
          "hover:shadow-lg dark:hover:shadow-2xl hover:shadow-primary/10 dark:hover:shadow-primary/20",
          isDragging && [
            "border-primary bg-gradient-to-br from-primary/10 to-primary/5",
            "shadow-xl shadow-primary/20 scale-[1.02]",
            "dark:from-primary/20 dark:to-primary/10",
          ],
          !isDragging && [
            "border-border hover:border-primary/50",
            "hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10",
          ],
          (disabled || uploading) && "pointer-events-none opacity-60"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
      >
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <input
          type="file"
          accept="image/*,video/*"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          disabled={disabled}
        />

        <div className="relative space-y-6">
          {/* Upload Icon with Animation */}
          <div className="relative mx-auto w-20 h-20">
            <div
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-500",
                "bg-gradient-to-br from-primary/20 to-primary/10",
                "group-hover:scale-110 group-hover:rotate-3",
                isDragging && "scale-110 rotate-3 from-primary/30 to-primary/20"
              )}
            />
            <div
              className={cn(
                "relative w-full h-full rounded-full flex items-center justify-center",
                "bg-gradient-to-br from-background to-muted",
                "border border-border group-hover:border-primary/30",
                "transition-all duration-500"
              )}
            >
              {isDragging ? (
                <CloudUpload className="w-10 h-10 text-primary animate-bounce" />
              ) : (
                <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              )}
            </div>
            {/* Sparkle Effect */}
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {isDragging ? "Release to upload" : "Upload your media"}
            </h3>
            <p className="text-muted-foreground text-lg">
              Drag and drop your files here, or click to browse
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm border">
              <div className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <Video className="w-4 h-4 text-purple-500" />
                <File className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                Images, Videos & More
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={disabled || uploading}
            className={cn(
              "pointer-events-none bg-background/80 backdrop-blur-sm",
              "border-primary/20 hover:border-primary/40",
              "hover:bg-primary/5 transition-all duration-300",
              "font-semibold text-lg px-8 py-3 h-auto"
            )}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              "Browse Files"
            )}
          </Button>
        </div>
      </div>

      {/* Currently Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <h4 className="text-lg font-semibold text-foreground">
                Uploading Files
              </h4>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {uploadingFiles.length} in progress
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {uploadingFiles.map((uploadedFile, index) => (
              <div
                key={`uploading-${index}`}
                className="group relative overflow-hidden rounded-xl border bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/30 p-4 backdrop-blur-sm"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 animate-pulse" />

                <div className="relative flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="relative p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                      {getFileIcon(uploadedFile.file)}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-foreground truncate mb-1">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(uploadedFile.status)}
                  </div>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      Uploading...
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {Math.round(uploadedFile.progress)}%
                    </span>
                  </div>
                  <div className="relative w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-3 overflow-hidden border border-blue-200/50 dark:border-blue-800/30">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out shadow-lg"
                      style={{ width: `${uploadedFile.progress}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse"
                      style={{ width: `${uploadedFile.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Successfully Uploaded Files */}
      {completedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <h4 className="text-lg font-semibold text-foreground">
                Uploaded Files
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {completedFiles.length} completed
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFiles}
                className="text-sm h-9 bg-background/50 backdrop-blur-sm hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedFiles.map((uploadedFile, index) => (
              <div
                key={`completed-${index}`}
                className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200/50 dark:border-emerald-800/30 p-4 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 backdrop-blur-sm"
              >
                {/* Success Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative flex items-start space-x-4">
                  {/* Enhanced File Preview */}
                  <div className="flex-shrink-0 relative">
                    {uploadedFile.file.type.startsWith("image/") ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted border border-border shadow-sm">
                        <img
                          src={uploadedFile.result.url || "/placeholder.svg"}
                          alt={uploadedFile.file.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-muted to-muted/50 border border-border flex items-center justify-center shadow-sm">
                        <Video className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Enhanced File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-foreground truncate mb-1">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatFileSize(uploadedFile.file.size)}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/30">
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              Success
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeUploadedFile(
                            uploadedFiles.indexOf(uploadedFile)
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 h-auto rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Upload Summary */}
      {uploadedFiles.length > 0 && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border p-6 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h5 className="text-lg font-semibold text-foreground">
                  Upload Summary
                </h5>
                <div className="flex items-center gap-1">
                  {completedFiles.length > 0 && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  )}
                  {uploadingFiles.length > 0 && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
              <p className="text-muted-foreground">
                <span className="font-medium">{uploadedFiles.length}</span>{" "}
                total files •
                <span className="font-medium text-emerald-600 dark:text-emerald-400 ml-1">
                  {completedFiles.length}
                </span>{" "}
                completed •
                <span className="font-medium text-blue-600 dark:text-blue-400 ml-1">
                  {uploadingFiles.length}
                </span>{" "}
                uploading
              </p>
            </div>
            {completedFiles.reduce((sum, f) => sum + f.file.size, 0) > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Size</p>
                <p className="text-lg font-bold text-foreground">
                  {formatFileSize(
                    completedFiles.reduce((sum, f) => sum + f.file.size, 0)
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
