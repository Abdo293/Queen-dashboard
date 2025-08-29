import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";
const BUCKET = process.env.SUPABASE_BUCKET || "media";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file)
      return NextResponse.json(
        { ok: false, error: "No file" },
        { status: 400 }
      );

    const supabase = await createClient();

    // (اختياري) لو محتاج تتأكد من المستخدم
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();

    // اختَر فولدر واحد ثابت (لو عايز فولدر الـUUID خليه هنا):
    // const root = "95989226-c12e-4f8c-82a0-59606a14b611/categories";
    // أو لو عايز على حسب المستخدم:
    // const root = `${user!.id}/categories`;
    const root = "95989226-c12e-4f8c-82a0-59606a14b611/categories";

    const key = `${root}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    // ارفع الملف
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(key, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (upErr) {
      return NextResponse.json(
        { ok: false, error: upErr.message },
        { status: 400 }
      );
    }

    // رجّع Signed URL (مثال: صلاحية سنة)
    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(key, 60 * 60 * 24 * 365);

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json(
        { ok: false, error: signErr?.message || "sign failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      url: signed.signedUrl, // ← خزّن ده في الداتابيز
      path: key, // ← وخزّن الـpath كمان لو حبيت
      bucket: BUCKET,
    });
  } catch (e: any) {
    console.error("upload error:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
