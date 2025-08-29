"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Tag,
  Percent,
  Ticket,
  TrendingUp,
  Calendar,
  Activity,
  ShoppingCart,
  Gift,
  TicketPercent,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/utils/supabase/client";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  activeOffers: number;
  activeCoupons: number;
  totalProductTypes: number;
}

interface ActiveOffer {
  id: string;
  title: string;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  end_date: string;
}

interface ActiveCoupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  end_date: string;
  usage_count?: number;
  usage_limit?: number | null;
}

export default function DashboardHome() {
  const t = useTranslations("dashboard");
  const supabase = createClient();

  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    activeOffers: 0,
    activeCoupons: 0,
    totalProductTypes: 0,
  });
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);
  const [activeCoupons, setActiveCoupons] = useState<ActiveCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch counts for all entities
      const [
        { count: productsCount },
        { count: categoriesCount },
        { count: productTypesCount },
        { data: offersData },
        { data: couponsData },
        { data: couponUsages },
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase
          .from("product_type")
          .select("*", { count: "exact", head: true }),
        supabase.from("offers").select("*").eq("is_active", true),
        supabase.from("coupons").select("*").eq("is_active", true),
        supabase.from("coupon_usages").select("coupon_id"),
      ]);

      // Process coupon usage data
      const usageMap: Record<string, number> = {};
      couponUsages?.forEach((usage) => {
        usageMap[usage.coupon_id] = (usageMap[usage.coupon_id] || 0) + 1;
      });

      // Filter active offers by date
      const now = new Date();
      const currentActiveOffers = (offersData || []).filter((offer) => {
        const startDate = new Date(offer.start_date);
        const endDate = new Date(offer.end_date);
        return now >= startDate && now <= endDate;
      });

      // Filter active coupons by date
      const currentActiveCoupons = (couponsData || [])
        .filter((coupon) => {
          const startDate = new Date(coupon.start_date);
          const endDate = new Date(coupon.end_date);
          return now >= startDate && now <= endDate;
        })
        .map((coupon) => ({
          ...coupon,
          usage_count: usageMap[coupon.id] || 0,
        }));

      setStats({
        totalProducts: productsCount || 0,
        totalCategories: categoriesCount || 0,
        activeOffers: currentActiveOffers.length,
        activeCoupons: currentActiveCoupons.length,
        totalProductTypes: productTypesCount || 0,
      });

      setActiveOffers(currentActiveOffers);
      setActiveCoupons(currentActiveCoupons);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDiscountValue = (type: string, value: number) => {
    return type === "percentage" ? `${value}%` : `$${value}`;
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.totalProducts")}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.productsDescription")}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.totalCategories")}
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.categoriesDescription")}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.totalProductTypes")}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProductTypes}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.productTypesDescription")}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.activeOffers")}
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.activeOffers}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("stats.offersDescription")}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.activeCoupons")}
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.activeCoupons}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("stats.couponsDescription")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Offers & Coupons */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Offers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              {t("activeOffers.title")}
            </CardTitle>
            <CardDescription>{t("activeOffers.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {activeOffers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("activeOffers.noOffers")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOffers.slice(0, 5).map((offer) => {
                  const daysRemaining = getDaysRemaining(offer.end_date);
                  return (
                    <div
                      key={offer.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{offer.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {formatDiscountValue(
                              offer.discount_type,
                              offer.discount_value
                            )}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {daysRemaining > 0
                              ? `${daysRemaining} ${t("activeOffers.daysLeft")}`
                              : t("activeOffers.expired")}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {activeOffers.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    {t("activeOffers.andMore", {
                      count: activeOffers.length - 5,
                    })}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Coupons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketPercent className="h-5 w-5" />
              {t("activeCoupons.title")}
            </CardTitle>
            <CardDescription>{t("activeCoupons.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {activeCoupons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("activeCoupons.noCoupons")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeCoupons.slice(0, 5).map((coupon) => {
                  const daysRemaining = getDaysRemaining(coupon.end_date);
                  const usagePercentage = coupon.usage_limit
                    ? Math.round(
                        ((coupon.usage_count || 0) / coupon.usage_limit) * 100
                      )
                    : 0;

                  return (
                    <div
                      key={coupon.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="font-mono font-semibold text-sm bg-muted px-2 py-1 rounded">
                            {coupon.code}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {formatDiscountValue(
                              coupon.discount_type,
                              coupon.discount_value
                            )}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {daysRemaining > 0
                              ? `${daysRemaining} ${t(
                                  "activeCoupons.daysLeft"
                                )}`
                              : t("activeCoupons.expired")}
                          </div>
                          {coupon.usage_limit && (
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {coupon.usage_count || 0}/{coupon.usage_limit}
                              {usagePercentage > 0 && (
                                <span className="ml-1">
                                  ({usagePercentage}%)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {activeCoupons.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    {t("activeCoupons.andMore", {
                      count: activeCoupons.length - 5,
                    })}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
