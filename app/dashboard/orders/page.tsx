import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { GOVERNORATES } from "@/lib/shipping";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/server";

type SearchParams = {
  q?: string;
  status?: string;
  page?: string;
};

const PAGE_SIZE = 20;

function fmtCurrency(n: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    // Ensure proper number formatting for Arabic
    numberingSystem: locale.startsWith("ar") ? "arab" : "latn",
  }).format(n);
}

export default async function OrdersPage({
  searchParams,
}: {
  // ✅ في Next.js 15: searchParams بقت Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const first = <T extends string | string[] | undefined>(v: T) =>
    Array.isArray(v) ? v[0] : v;
  const q = ((first(sp.q) as string) || "").trim();
  const status = ((first(sp.status) as string) || "").trim();
  const page = Math.max(1, Number(first(sp.page) || 1));

  const t = await getTranslations("orders");
  const locale = await getLocale();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);
  if (q) {
    const pattern = `%${q}%`;
    query = query.or(
      `customer_name.ilike.${pattern},customer_email.ilike.${pattern},customer_phone.ilike.${pattern},id.ilike.${pattern}`
    );
  }

  const { data: rows, count, error } = await query;
  if (error) throw error;

  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  const nextQs = (overrides: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    sp.set("page", String(overrides.page ?? page));
    return `?${sp.toString()}`;
  };

  const statuses = [
    { value: "all", label: t("all"), variant: "outline" as const },
    { value: "pending", label: t("pending"), variant: "secondary" as const },
    {
      value: "processing",
      label: t("processing"),
      variant: "default" as const,
    },
    { value: "shipped", label: t("shipped"), variant: "default" as const },
    { value: "delivered", label: t("delivered"), variant: "default" as const },
    {
      value: "canceled",
      label: t("canceled"),
      variant: "destructive" as const,
    },
  ];

  const isArabic = locale.startsWith("ar");

  return (
    <div className="container px-3 py-8 w-full">
      <Card className="border-blue-200/60 w-full">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-xl">{t("title")}</CardTitle>

          <form
            className="flex items-end gap-3"
            action="/dashboard/orders"
            method="get"
          >
            <div className="space-y-1">
              <Label htmlFor="q">{t("search")}</Label>
              <Input
                id="q"
                name="q"
                defaultValue={q}
                placeholder={t("searchPh")}
                className="w-64"
              />
            </div>

            <div className="space-y-1">
              <Label>{t("status")}</Label>
              <Select name="status" defaultValue={status}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder={t("all")} />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s?.value || "all"} value={s?.value}>
                      {s?.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <input type="hidden" name="page" value="1" />
            <Button type="submit">{t("filter")}</Button>
          </form>
        </CardHeader>

        <CardContent className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={isArabic ? "text-right" : ""}>
                  {t("th.date")}
                </TableHead>
                <TableHead className={isArabic ? "text-right" : ""}>
                  {t("th.customer")}
                </TableHead>
                <TableHead className={isArabic ? "text-right" : ""}>
                  {t("th.governorate")}
                </TableHead>
                <TableHead className="text-right">{t("th.subtotal")}</TableHead>
                <TableHead className="text-right">{t("th.shipping")}</TableHead>
                <TableHead className="text-right">{t("th.total")}</TableHead>
                <TableHead className={isArabic ? "text-right" : ""}>
                  {t("th.status")}
                </TableHead>
                <TableHead className="text-right">{t("th.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows?.map((o) => {
                const gov =
                  GOVERNORATES[o.governorate_key as keyof typeof GOVERNORATES];
                const currency = o.currency || "EGP";
                return (
                  <TableRow key={o.id}>
                    <TableCell
                      className={isArabic ? "text-right" : ""}
                      dir="ltr"
                    >
                      <span dir="ltr">
                        {new Date(o.created_at).toLocaleString(locale)}
                      </span>
                    </TableCell>
                    <TableCell className={isArabic ? "text-right" : ""}>
                      <div className="font-medium">{o.customer_name}</div>
                      <div className="text-xs text-muted-foreground">
                        <span dir="ltr">{o.customer_phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className={isArabic ? "text-right" : ""}>
                      {gov
                        ? locale.startsWith("ar")
                          ? gov.ar
                          : gov.en
                        : o.governorate_key}
                    </TableCell>
                    <TableCell className="text-right">
                      <span dir="ltr">
                        {fmtCurrency(Number(o.subtotal), locale, currency)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span dir="ltr">
                        {fmtCurrency(Number(o.shipping_fee), locale, currency)}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-right">
                      <span dir="ltr">
                        {fmtCurrency(Number(o.total), locale, currency)}
                      </span>
                    </TableCell>
                    <TableCell className={isArabic ? "text-right" : ""}>
                      <Badge
                        variant={
                          o.status === "canceled"
                            ? "destructive"
                            : o.status === "pending"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {t(`status_${o.status}` as any)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/orders/${o.id}`}>
                          {t("view")}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!rows?.length && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground"
                  >
                    {t("noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <span dir="ltr">
                {t("showing", {
                  from: from + 1,
                  to: Math.min(to + 1, count || 0),
                  total: count || 0,
                })}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild disabled={page <= 1}>
                <Link href={nextQs({ page: page - 1 })}>{t("prev")}</Link>
              </Button>
              <Button variant="outline" asChild disabled={page >= totalPages}>
                <Link href={nextQs({ page: page + 1 })}>{t("next")}</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
