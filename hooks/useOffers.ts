import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applies_to: "all" | "category" | "product";
  category_id?: string | null;
  product_id?: string | null;
}

export function useOffers() {
  const supabase = createClient();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    const { data } = await supabase.from("offers").select("*");
    if (data) setOffers(data);
    setLoading(false);
  };

  const addOffer = async (offer: Omit<Offer, "id">) => {
    const { error } = await supabase.from("offers").insert(offer);
    if (!error) fetchOffers();
    return error;
  };

  const updateOffer = async (id: string, updates: Partial<Offer>) => {
    const { error } = await supabase
      .from("offers")
      .update(updates)
      .eq("id", id);
    if (!error) fetchOffers();
    return error;
  };

  const deleteOffer = async (id: string) => {
    const { error } = await supabase.from("offers").delete().eq("id", id);
    if (!error) fetchOffers();
    return error;
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return {
    offers,
    loading,
    fetchOffers,
    addOffer,
    updateOffer,
    deleteOffer,
  };
}
