// app/api/orders/[id]/status/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

export const runtime = "nodejs";

const Body = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "canceled"]),
});

export async function PATCH(
  req: Request,
  // ملاحظة: params دلوقتي Promise في Next.js 15
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ← لازم await هنا
    const { status } = Body.parse(await req.json());

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select("id,status")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, order: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
