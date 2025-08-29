// /lib/cloudinary.ts  (نفس الاسم علشان ما تغيّرش أي imports)
export async function uploadToCloudinary(file: File): Promise<{
  url: string;
  public_id: string; // هنرجع الpath من Supabase هنا
  type: "image" | "video";
}> {
  // بنبعت الملف لراوت السيرفر بتاعك اللي بيرفع على Supabase
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/upload/imgs", {
    method: "POST",
    body: fd,
  });

  const json = await res.json();

  if (!res.ok || !json?.ok || !json?.url) {
    throw new Error(json?.error || "Failed to upload media");
  }

  // حافظنا على نفس الشكل المتوقع:
  // - url: الSigned/Public URL الراجع من الراوت
  // - public_id: هنخليه path جوه الbucket عشان تستخدمه لاحقًا لو حابب تحذف/تجدد توقيع
  // - type: حسب mime
  return {
    url: json.url as string,
    public_id:
      (json.path as string) ||
      (json.public_id as string) ||
      (json.url as string),
    type: file.type.startsWith("video/") ? "video" : "image",
  };
}

// لم نعد نحتاج optimizeCloudinaryUrl – Supabase مش بيعمل تحوّلات زي Cloudinary.
// أي "تحسين" أو مقاسات مختلفة بنعملها عند الرفع على السيرفر (sharp) لو حبيت.

// export async function uploadToCloudinary(file: File): Promise<{
//   url: string;
//   public_id: string;
//   type: "image" | "video";
// }> {
//   const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
//   const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("upload_preset", uploadPreset);

//   const isVideo = file.type.startsWith("video/");
//   const endpoint = isVideo ? "video" : "image";

//   const res = await fetch(
//     `https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}/upload`,
//     {
//       method: "POST",
//       body: formData,
//     }
//   );

//   if (!res.ok) throw new Error("Failed to upload media");

//   const data = await res.json();

//   return {
//     url: optimizeCloudinaryUrl(data.secure_url),
//     public_id: data.public_id,
//     type: isVideo ? "video" : "image",
//   };
// }

// function optimizeCloudinaryUrl(url: string): string {
//   return url.replace("/upload/", "/upload/f_auto,q_auto/");
// }
