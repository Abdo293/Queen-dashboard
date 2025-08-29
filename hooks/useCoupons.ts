"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  usage_limit?: number | null;
  used_count?: number | null;
  usage_count?: number; // ✅ أضف هذا السطر
  min_order_value?: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export function useCoupons() {
  const supabase = createClient();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);

    const { data: coupons, error } = await supabase.from("coupons").select("*");

    if (error || !coupons) {
      setCoupons([]);
      setLoading(false); // ✅ حتى في حالة الخطأ
      return;
    }

    const { data: usages } = await supabase
      .from("coupon_usages")
      .select("coupon_id");

    const usageMap: Record<string, number> = {};
    usages?.forEach((usage) => {
      usageMap[usage.coupon_id] = (usageMap[usage.coupon_id] || 0) + 1;
    });

    const couponsWithUsage = coupons.map((coupon) => ({
      ...coupon,
      usage_count: usageMap[coupon.id] || 0,
    }));

    setCoupons(couponsWithUsage);
    setLoading(false); // ✅ في نهاية التحميل
  };

  const addCoupon = async (data: Partial<Coupon>) => {
    const { error } = await supabase.from("coupons").insert(data);
    return error ? { success: false, error } : { success: true };
  };

  const updateCoupon = async (id: string, data: Partial<Coupon>) => {
    const { error } = await supabase.from("coupons").update(data).eq("id", id);
    return error ? { success: false, error } : { success: true };
  };

  const deleteCoupon = async (id: string) => {
    // جرّب الحذف مباشرة
    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) {
      // Foreign key violation: الكود الشهير في Postgres هو 23503
      const pgCode = (error as any)?.code || (error as any)?.hint || "";
      if (pgCode === "23503" || String(error.message).includes("foreign key")) {
        return {
          success: false,
          error: {
            message: "لا يمكن حذف الكوبون لأنه تم استخدامه من قبل.",
            code: "COUPON_USED",
          },
        };
      }
      return { success: false, error };
    }

    return { success: true };
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return {
    coupons,
    loading,
    error,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    refreshCoupons: fetchCoupons,
  };
}
