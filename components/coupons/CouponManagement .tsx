"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Percent,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { useCoupons, type Coupon } from "@/hooks/useCoupons";

export const CouponManagement = () => {
  const t = useTranslations("coupons.management");
  const locale = useLocale();
  const isRTL = locale === "ar" || locale === "he" || locale === "fa";
  const [couponToDelete, setCouponToDelete] = useState<{
    id: string;
    code: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // CSS classes for RTL/LTR support
  const rtlStyles = isRTL
    ? `
    .rtl { direction: rtl; text-align: right; }
    .rtl .flex { flex-direction: row-reverse; }
    .rtl .space-x-2 > * + * { margin-left: 0; margin-right: 0.5rem; }
    .rtl .space-x-reverse > * + * { margin-left: 0.5rem; margin-right: 0; }
    .rtl .mr-2 { margin-right: 0; margin-left: 0.5rem; }
    .rtl .ml-2 { margin-left: 0; margin-right: 0.5rem; }
    .rtl .justify-end { justify-content: flex-start; }
    .rtl .justify-start { justify-content: flex-end; }
    .rtl .text-left { text-align: right; }
    .rtl .text-right { text-align: left; }
  `
    : `
    .ltr { direction: ltr; text-align: left; }
  `;

  const {
    coupons,
    loading,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    refreshCoupons,
  } = useCoupons();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    usage_limit: "",
    min_order_value: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      code: "",
      discount_type: "percentage",
      discount_value: 0,
      usage_limit: "",
      min_order_value: "",
      start_date: "",
      end_date: "",
      is_active: true,
    });
    setEditingCoupon(null);
  };

  const openDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        usage_limit: coupon.usage_limit?.toString() || "",
        min_order_value: coupon.min_order_value?.toString() || "",
        start_date: coupon.start_date.split("T")[0],
        end_date: coupon.end_date.split("T")[0],
        is_active: coupon.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
    setAlert(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlert(null);

    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        usage_limit: formData.usage_limit
          ? parseInt(formData.usage_limit)
          : null,
        min_order_value: formData.min_order_value
          ? parseFloat(formData.min_order_value)
          : null,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        is_active: formData.is_active,
      };

      let result;
      if (editingCoupon) {
        result = await updateCoupon(editingCoupon.id, couponData);
      } else {
        result = await addCoupon(couponData);
      }

      if (result.success) {
        setAlert({
          type: "success",
          message: editingCoupon ? t("alerts.updated") : t("alerts.created"),
        });
        await refreshCoupons();
        setTimeout(closeDialog, 1500);
      } else {
        setAlert({
          type: "error",
          message: result.error?.message || t("alerts.error"),
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: t("alerts.error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: string, code: string) => {
    setCouponToDelete({ id, code });
  };

  const performDelete = async () => {
    if (!couponToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteCoupon(couponToDelete.id);
      if (result.success) {
        await refreshCoupons();
        setCouponToDelete(null); // Close the dialog only on success
      } else {
        // Handle error case - you might want to show an error message
        console.error("Delete failed:", result.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);

    if (!coupon.is_active) {
      return { status: "inactive", icon: XCircle, color: "text-gray-500" };
    }

    if (now < startDate) {
      return { status: "scheduled", icon: Calendar, color: "text-blue-500" };
    }

    if (now > endDate) {
      return { status: "expired", icon: AlertTriangle, color: "text-red-500" };
    }

    if (
      coupon.usage_limit &&
      coupon.used_count &&
      coupon.used_count >= coupon.usage_limit
    ) {
      return { status: "limitReached", icon: Users, color: "text-orange-500" };
    }

    return { status: "active", icon: CheckCircle, color: "text-green-500" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale);
  };

  return (
    <div
      className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <style>{rtlStyles}</style>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("buttons.create")}
            </Button>
          </DialogTrigger>
          <DialogContent
            className={`max-w-2xl ${isRTL ? "rtl" : "ltr"}`}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <DialogHeader>
              <DialogTitle>
                {editingCoupon
                  ? t("dialog.editTitle")
                  : t("dialog.createTitle")}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {alert && (
                <Alert
                  variant={alert.type === "error" ? "destructive" : "default"}
                >
                  {alert.type === "error" ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">{t("form.code.label")}</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, code: e.target.value }))
                    }
                    placeholder={t("form.code.placeholder")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_type">
                    {t("form.discountType.label")}
                  </Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, discount_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        {t("form.discountType.percentage")}
                      </SelectItem>
                      <SelectItem value="fixed">
                        {t("form.discountType.fixed")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  {formData.discount_type === "percentage"
                    ? t("form.discountValue.percentageLabel")
                    : t("form.discountValue.fixedLabel")}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discount_value: parseFloat(e.target.value) || 0,
                    }))
                  }
                  min="0"
                  max={
                    formData.discount_type === "percentage" ? "100" : undefined
                  }
                  step={formData.discount_type === "fixed" ? "0.01" : "1"}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usage_limit">
                    {t("form.usageLimit.label")}
                  </Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        usage_limit: e.target.value,
                      }))
                    }
                    placeholder={t("form.usageLimit.placeholder")}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_order_value">
                    {t("form.minOrderValue.label")}
                  </Label>
                  <Input
                    id="min_order_value"
                    type="number"
                    value={formData.min_order_value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        min_order_value: e.target.value,
                      }))
                    }
                    placeholder={t("form.minOrderValue.placeholder")}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">
                    {t("form.startDate.label")}
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">{t("form.endDate.label")}</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div
                className={`flex items-center ${
                  isRTL ? "space-x-reverse" : ""
                } space-x-2`}
              >
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
                />
                <Label htmlFor="is_active">{t("form.isActive.label")}</Label>
              </div>

              <div
                className={`flex gap-3 pt-4 ${
                  isRTL ? "justify-start" : "justify-end"
                }`}
              >
                <Button type="button" variant="outline" onClick={closeDialog}>
                  {t("buttons.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? t("buttons.saving")
                    : editingCoupon
                    ? t("buttons.update")
                    : t("buttons.create")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("table.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">{t("loading")}</div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                className={isRTL ? "rtl" : "ltr"}
                dir={isRTL ? "rtl" : "ltr"}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t("table.code")}
                    </TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t("table.discount")}
                    </TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t("table.usage")}
                    </TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t("table.dates")}
                    </TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t("table.status")}
                    </TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t("table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => {
                    const statusInfo = getCouponStatus(coupon);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <TableRow key={coupon.id}>
                        <TableCell
                          className={isRTL ? "text-right" : "text-left"}
                        >
                          <Badge variant="outline" className="font-mono">
                            {coupon.code}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={isRTL ? "text-right" : "text-left"}
                        >
                          <div
                            className={`flex items-center gap-1 ${
                              isRTL
                                ? "flex-row-reverse justify-end"
                                : "justify-start"
                            }`}
                          >
                            {coupon.discount_type === "percentage" ? (
                              <Percent className="h-3 w-3" />
                            ) : (
                              <DollarSign className="h-3 w-3" />
                            )}
                            <span>
                              {coupon.discount_type === "percentage"
                                ? `${coupon.discount_value}%`
                                : `$${coupon.discount_value}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          className={`text-sm ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          {coupon.usage_count || 0} /{" "}
                          {coupon.usage_limit || "∞"}
                        </TableCell>

                        <TableCell
                          className={isRTL ? "text-right" : "text-left"}
                        >
                          <div className="text-sm space-y-1">
                            <div>{formatDate(coupon.start_date)}</div>
                            <div className="text-muted-foreground">
                              {formatDate(coupon.end_date)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell
                          className={isRTL ? "text-right" : "text-left"}
                        >
                          <div
                            className={`flex items-center gap-2 ${
                              isRTL
                                ? "flex-row-reverse justify-end"
                                : "justify-start"
                            }`}
                          >
                            <StatusIcon
                              className={`h-4 w-4 ${statusInfo.color}`}
                            />
                            <span className="text-sm">
                              {t(`status.${statusInfo.status}`)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          className={isRTL ? "text-right" : "text-left"}
                        >
                          <div
                            className={`flex gap-2 ${
                              isRTL
                                ? "flex-row-reverse justify-end"
                                : "justify-start"
                            }`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDialog(coupon)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                confirmDelete(coupon.id, coupon.code)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!couponToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setCouponToDelete(null);
          }
        }}
      >
        <DialogContent
          className={isRTL ? "rtl" : "ltr"}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <DialogHeader>
            <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {t("deleteDialog.message", { code: couponToDelete?.code ?? "" })}
              <strong>{couponToDelete?.code}</strong>?
            </p>
          </div>
          <div
            className={`flex gap-2 ${isRTL ? "justify-start" : "justify-end"}`}
          >
            <Button
              variant="outline"
              onClick={() => setCouponToDelete(null)}
              disabled={isDeleting}
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={performDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t("buttons.deleting") : t("buttons.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
