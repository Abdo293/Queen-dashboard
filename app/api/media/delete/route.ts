// /app/api/media/delete/route.ts
import { NextResponse } from "next/server";
import { createClient as createSupaAdmin } from "@supabase/supabase-js";

export const runtime = "nodejs"; // مهم جداً

// ===== Supabase Admin (لازم SERVICE ROLE) =====
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supaAdmin = createSupaAdmin(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type ReqBody = {
  // Supabase (اختار طريقة واحدة أو الاتنين)
  supa_bucket?: string; // مثال: "media"
  supa_paths?: string[]; // مثال: ["user123/categories/a.webp", "user123/categories/b.webp"]
  supa_urls?: string[]; // مثال: ["https://.../storage/v1/object/public/media/user123/.../a.webp", ...]
};

// استخرج bucket/path من URL عام أو موقّع
function parseSupaUrl(u: string): { bucket: string; path: string } | null {
  try {
    const url = new URL(u);
    // أمثلة مسارات:
    // /storage/v1/object/public/<bucket>/<path>
    // /storage/v1/object/sign/<bucket>/<path>?token=...
    const parts = url.pathname.split("/").filter(Boolean);
    const objectIdx = parts.indexOf("object");
    if (objectIdx === -1 || !parts[objectIdx + 2]) return null;

    const bucket = parts[objectIdx + 2]; // بعد "object" و "public|sign"
    let rest = parts.slice(objectIdx + 3).join("/"); // باقي الأجزاء = path
    if (rest.includes("?")) rest = rest.split("?")[0];
    return { bucket, path: rest };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;

    // جهّز البكت والمسارات
    let bucket = body.supa_bucket?.trim();
    const paths: string[] = [];

    // 1) لو فيه URLs: هنستخرج منها البكت/المسار
    if (Array.isArray(body.supa_urls) && body.supa_urls.length) {
      for (const u of body.supa_urls) {
        const parsed = parseSupaUrl(u);
        if (parsed) {
          if (!bucket) bucket = parsed.bucket;
          if (bucket !== parsed.bucket) {
            return NextResponse.json(
              { error: "URLs تشير إلى Buckets مختلفة. أرسل Bucket واحد فقط." },
              { status: 400 }
            );
          }
          paths.push(parsed.path);
        }
      }
    }

    // 2) لو فيه paths صريحة
    if (Array.isArray(body.supa_paths) && body.supa_paths.length) {
      for (const p of body.supa_paths) {
        const clean = String(p).replace(/^\/+/, ""); // امنع "/" في البداية
        paths.push(clean);
      }
    }

    if (!bucket || paths.length === 0) {
      return NextResponse.json(
        { error: "أرسل supa_bucket مع supa_paths أو أرسل supa_urls." },
        { status: 400 }
      );
    }

    // 3) المسح
    const { data, error } = await supaAdmin.storage.from(bucket).remove(paths);

    if (error) {
      // error عام (فشل الكل). data قد تكون undefined
      return NextResponse.json(
        { success: false, error: error.message, details: data },
        { status: 500 }
      );
    }

    // data: مصفوفة بنتائج كل ملف (قد تحوي أخطاء لعناصر معينة)
    return NextResponse.json({ success: true, results: data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
