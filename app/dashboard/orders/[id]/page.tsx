import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { GOVERNORATES } from "@/lib/shipping";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import StatusSelect from "./StatusSelect";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled";

function fmtCurrency(n: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    numberingSystem: locale.startsWith("ar") ? "arab" : "latn",
  }).format(n);
}

export default async function OrderDetails({
  params,
}: {
  // ✅ params كـ Promise
  params: Promise<{ id: string }>;
}) {
  // ✅ لازم await
  const { id } = await params;

  const t = await getTranslations("orderDetails");
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (error || !order) notFound();

  const gov = GOVERNORATES[order.governorate_key as keyof typeof GOVERNORATES];
  const currency = order.currency || "EGP";
  const status = (order.status || "pending") as OrderStatus;
  const isArabic = locale.startsWith("ar");

  return (
    <div className="container px-3 py-8">
      <div className="mb-4">
        <Button asChild variant="outline">
          <Link href="/dashboard/orders">{t("back")}</Link>
        </Button>
      </div>

      <Card className="border-blue-200/60">
        <CardHeader className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <CardTitle className="text-xl">{t("title")} </CardTitle>

          {/* التحكم في الحالة + شارة الحالة الحالية */}
          <div className="flex items-center gap-3">
            <StatusSelect orderId={order.id} value={status} />
            <Badge
              variant={
                status === "canceled"
                  ? "destructive"
                  : status === "pending"
                  ? "secondary"
                  : "default"
              }
            >
              {t(`status_${status}` as any)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Customer & Address */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="mb-2 font-semibold">{t("customer")}</h3>
              <div className="text-sm">
                <div>{order.customer_name}</div>
                {order.customer_email && (
                  <div className="text-muted-foreground">
                    {order.customer_email}
                  </div>
                )}
                <div className="text-muted-foreground">
                  <span dir="ltr">{order.customer_phone}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">{t("shippingAddress")}</h3>
              <div className="text-sm">
                <div>
                  {gov
                    ? locale.startsWith("ar")
                      ? gov.ar
                      : gov.en
                    : order.governorate_key}
                </div>
                <div>{order.address1}</div>
                {order.address2 && <div>{order.address2}</div>}
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">{t("notes")}</h3>
              <div>{order.notes || t("noNotes")}</div>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <h3 className="mb-3 font-semibold">{t("items")}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isArabic ? "text-right" : ""}>
                    {t("th.item")}
                  </TableHead>
                  <TableHead className="text-center">{t("th.qty")}</TableHead>
                  <TableHead className="text-right">{t("th.price")}</TableHead>
                  <TableHead className="text-right">{t("th.total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.order_items?.map((it: any) => {
                  const name = locale.startsWith("ar")
                    ? it.name_ar || it.name_en
                    : it.name_en || it.name_ar;
                  const line = Number(it.price) * Number(it.qty);
                  return (
                    <TableRow key={it.id}>
                      <TableCell className={isArabic ? "text-right" : ""}>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-md ring-1 ring-blue-100">
                            <Image
                              src={it.img || "/placeholder.svg"}
                              alt={name || "item"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="font-medium">{name || "Item"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span dir="ltr">{it.qty}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span dir="ltr">
                          {fmtCurrency(Number(it.price), locale, currency)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span dir="ltr">
                          {fmtCurrency(line, locale, currency)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{t("subtotal")}</span>
                <span dir="ltr">
                  {fmtCurrency(Number(order.subtotal), locale, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("shipping")}</span>
                <span dir="ltr">
                  {fmtCurrency(Number(order.shipping_fee), locale, currency)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>{t("grandTotal")}</span>
                <span dir="ltr">
                  {fmtCurrency(Number(order.total), locale, currency)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
