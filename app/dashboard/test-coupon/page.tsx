"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TestCouponPage() {
  const supabase = createClient();

  const [orderTotal, setOrderTotal] = useState<number>(100);
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountedTotal, setDiscountedTotal] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");

  const applyCoupon = async () => {
    setMessage("");
    setDiscountedTotal(null);

    if (!couponCode.trim()) {
      setMessage("برجاء إدخال كود الكوبون.");
      return;
    }

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.trim())
      .single();

    if (error || !coupon) {
      setMessage("الكوبون غير موجود.");
      return;
    }

    if (!coupon.is_active) {
      setMessage("الكوبون غير مفعل.");
      return;
    }

    const now = new Date().toISOString();

    if (coupon.start_date && now < coupon.start_date) {
      setMessage("الكوبون لم يبدأ بعد.");
      return;
    }

    if (coupon.end_date && now > coupon.end_date) {
      setMessage("الكوبون منتهي.");
      return;
    }

    // التحقق من الحد الأقصى للاستخدام
    if (coupon.usage_limit !== null && coupon.usage_limit !== undefined) {
      const { count, error: usageError } = await supabase
        .from("coupon_usages")
        .select("*", { count: "exact", head: true })
        .eq("coupon_id", coupon.id);

      if (usageError) {
        setMessage("حدث خطأ أثناء التحقق من عدد مرات الاستخدام.");
        return;
      }

      if ((count ?? 0) >= coupon.usage_limit) {
        setMessage("تم الوصول إلى الحد الأقصى لاستخدام هذا الكوبون.");
        return;
      }
    }

    if (coupon.min_order_value && orderTotal < coupon.min_order_value) {
      setMessage(`الحد الأدنى لتفعيل الكوبون هو ${coupon.min_order_value}$`);
      return;
    }

    let final = orderTotal;

    if (coupon.discount_type === "percentage") {
      final = orderTotal - (orderTotal * coupon.discount_value) / 100;
    } else if (coupon.discount_type === "fixed") {
      final = orderTotal - coupon.discount_value;
    }

    // سجل الاستخدام
    await supabase.from("coupon_usages").insert({
      coupon_id: coupon.id,
    });

    setDiscountedTotal(final > 0 ? final : 0);
    setMessage(`تم تطبيق الكوبون بنجاح. السعر بعد الخصم: ${final.toFixed(2)}$`);
  };

  return (
    <div className="p-6 max-w-lg space-y-4">
      <h2 className="text-2xl font-bold">تجربة الكوبونات</h2>

      <Input
        type="number"
        value={orderTotal}
        onChange={(e) => setOrderTotal(parseFloat(e.target.value))}
        placeholder="قيمة الطلب"
      />

      <Input
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        placeholder="ادخل كود الكوبون"
      />

      <Button onClick={applyCoupon}>تطبيق الكوبون</Button>

      {message && <div className="text-sm text-gray-700">{message}</div>}
      {discountedTotal !== null && (
        <div className="text-lg font-semibold">
          السعر النهائي بعد الخصم: ${discountedTotal.toFixed(2)}
        </div>
      )}
    </div>
  );
}
