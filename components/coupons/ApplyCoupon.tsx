"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Percent,
  Calendar,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { useCoupons, type Coupon } from "@/hooks/useCoupons";

interface ApplyCouponProps {
  onCouponApplied?: (coupon: Coupon) => void;
  orderValue?: number;
}

export const ApplyCoupon = ({
  onCouponApplied,
  orderValue = 0,
}: ApplyCouponProps) => {
  const t = useTranslations("coupons");
  const { coupons } = useCoupons();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateCoupon = (
    coupon: Coupon
  ): { isValid: boolean; message?: string } => {
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);

    if (!coupon.is_active) {
      return { isValid: false, message: t("errors.inactive") };
    }

    if (now < startDate) {
      return { isValid: false, message: t("errors.notStarted") };
    }

    if (now > endDate) {
      return { isValid: false, message: t("errors.expired") };
    }

    if (
      coupon.usage_limit &&
      coupon.used_count &&
      coupon.used_count >= coupon.usage_limit
    ) {
      return { isValid: false, message: t("errors.usageLimitReached") };
    }

    if (coupon.min_order_value && orderValue < coupon.min_order_value) {
      return {
        isValid: false,
        message: t("errors.minOrderValue", { amount: coupon.min_order_value }),
      };
    }

    return { isValid: true };
  };

  const calculateDiscount = (coupon: Coupon, orderValue: number): number => {
    if (coupon.discount_type === "percentage") {
      return (orderValue * coupon.discount_value) / 100;
    } else if (coupon.discount_type === "fixed") {
      // For fixed discounts, return the discount value but don't exceed order value
      return Math.min(coupon.discount_value, orderValue);
    }
    return 0;
  };

  const handleApplyCoupon = () => {
    setError(null);
    setSuccess(null);

    if (!couponCode.trim()) {
      setError(t("errors.enterCode"));
      return;
    }

    const coupon = coupons.find(
      (c) => c.code.toLowerCase() === couponCode.toLowerCase()
    );

    if (!coupon) {
      setError(t("errors.notFound"));
      return;
    }

    const validation = validateCoupon(coupon);
    if (!validation.isValid) {
      setError(validation.message || t("errors.invalid"));
      return;
    }

    const discountAmount = calculateDiscount(coupon, orderValue);
    setAppliedCoupon(coupon);
    setSuccess(
      t("success.applied", {
        code: coupon.code,
        discount: discountAmount.toFixed(2),
      })
    );

    if (onCouponApplied) {
      onCouponApplied(coupon);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setError(null);
    setSuccess(null);
    if (onCouponApplied) {
      onCouponApplied(null as any);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discount_type === "percentage") {
      return t("applied.discountPercentage", {
        value: coupon.discount_value,
      });
    } else {
      return t("applied.discountFixed", {
        value: coupon.discount_value.toFixed(2),
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!appliedCoupon ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder={t("placeholders.enterCode")}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                className="flex-1"
              />
              <Button onClick={handleApplyCoupon} disabled={!couponCode.trim()}>
                {t("buttons.apply")}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold">
                    {t("applied.title", { code: appliedCoupon.code })}
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      {appliedCoupon.discount_type === "percentage" ? (
                        <Percent className="h-3 w-3" />
                      ) : (
                        <DollarSign className="h-3 w-3" />
                      )}
                      {formatDiscountDisplay(appliedCoupon)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {t("applied.validUntil", {
                        date: formatDate(appliedCoupon.end_date),
                      })}
                    </div>
                    {appliedCoupon.min_order_value && (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-3 w-3" />
                        {t("applied.minOrder", {
                          amount: appliedCoupon.min_order_value.toFixed(2),
                        })}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      Discount Amount:{" "}
                      {appliedCoupon.discount_type === "percentage"
                        ? `${calculateDiscount(
                            appliedCoupon,
                            orderValue
                          ).toFixed(2)} (${
                            appliedCoupon.discount_value
                          }% of ${orderValue.toFixed(2)})`
                        : `${Math.min(
                            appliedCoupon.discount_value,
                            orderValue
                          ).toFixed(2)}`}
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
            <Button
              variant="outline"
              onClick={handleRemoveCoupon}
              className="w-full"
            >
              {t("buttons.remove")}
            </Button>
          </div>
        )}

        {/* Available Coupons Preview */}
        {!appliedCoupon && coupons.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">{t("available.title")}</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {coupons
                .filter((coupon) => validateCoupon(coupon).isValid)
                .slice(0, 3)
                .map((coupon) => (
                  <div
                    key={coupon.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setCouponCode(coupon.code)}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {coupon.code}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {coupon.discount_type === "percentage" ? (
                          <Percent className="h-3 w-3" />
                        ) : (
                          <DollarSign className="h-3 w-3" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}%`
                            : `${coupon.discount_value}`}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {t("available.expires", {
                        date: formatDate(coupon.end_date),
                      })}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
