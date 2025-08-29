"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type Props = {
  orderId: string;
  value: "pending" | "processing" | "shipped" | "delivered" | "canceled";
};

export default function StatusSelect({ orderId, value }: Props) {
  const t = useTranslations("orderDetails");
  const [status, setStatus] = useState<Props["value"]>(value);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function update(next: Props["value"]) {
    setStatus(next);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(await res.text());
      startTransition(() => router.refresh());
    } catch (e) {
      // رجّع القيمة القديمة لو حصل خطأ
      setStatus(value);
      alert(t("updateFailed"));
      console.error(e);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm">{t("statusLabel")}</Label>
      <Select value={status} onValueChange={(v: Props["value"]) => update(v)}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">{t("status_pending")}</SelectItem>
          <SelectItem value="processing">{t("status_processing")}</SelectItem>
          <SelectItem value="shipped">{t("status_shipped")}</SelectItem>
          <SelectItem value="delivered">{t("status_delivered")}</SelectItem>
          <SelectItem value="canceled">{t("status_canceled")}</SelectItem>
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  );
}
