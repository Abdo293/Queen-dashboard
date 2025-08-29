"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useOffers } from "@/hooks/useOffers";
import { OfferForm, OfferFormInput } from "@/components/offers/OfferForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Target,
  Percent,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Copy,
} from "lucide-react";

export default function OffersPage() {
  const t = useTranslations("offers");
  const locale = useLocale();
  const { offers, addOffer, updateOffer, deleteOffer, loading } = useOffers();

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "scheduled"
  >("all");

  // Helper function to get localized title
  const getLocalizedTitle = (offer: any) => {
    if (locale === "ar") {
      return offer.title_ar || offer.title_en || offer.title || "";
    }
    return offer.title_en || offer.title || "";
  };

  // Helper function to get localized description
  const getLocalizedDescription = (offer: any) => {
    if (locale === "ar") {
      return (
        offer.description_ar || offer.description_en || offer.description || ""
      );
    }
    return offer.description_en || offer.description || "";
  };

  const handleSave = async (data: OfferFormInput) => {
    await addOffer(data as any);
    setOpen(false);
  };

  const handleUpdate = async (data: OfferFormInput) => {
    if (!selected) return;
    await updateOffer(selected.id, data);
    setEditOpen(false);
    setSelected(null);
  };

  const handleEdit = (offer: any) => {
    setSelected(offer);
    setEditOpen(true);
  };

  const handleDuplicate = async (offer: any) => {
    const duplicatedOffer = {
      ...offer,
      title_ar: offer.title_ar
        ? `${offer.title_ar} - ${t("actions.copy")}`
        : undefined,
      title_en: offer.title_en
        ? `${offer.title_en} - ${t("actions.copy")}`
        : undefined,
      title: offer.title ? `${offer.title} - ${t("actions.copy")}` : undefined,
      id: undefined,
    };
    await addOffer(duplicatedOffer);
  };

  const getOfferStatus = (offer: any) => {
    const now = new Date();
    const startDate = new Date(offer.start_date);
    const endDate = new Date(offer.end_date);

    if (!offer.is_active) return "inactive";
    if (now < startDate) return "scheduled";
    if (now > endDate) return "expired";
    return "active";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        variant: "default" as const,
        icon: CheckCircle,
        text: t("status.active"),
      },
      inactive: {
        variant: "secondary" as const,
        icon: XCircle,
        text: t("status.inactive"),
      },
      scheduled: {
        variant: "outline" as const,
        icon: Clock,
        text: t("status.scheduled"),
      },
      expired: {
        variant: "destructive" as const,
        icon: XCircle,
        text: t("status.expired"),
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.inactive;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getDiscountDisplay = (offer: any) => {
    return offer.discount_type === "percentage"
      ? t("discount.percentage", { value: offer.discount_value })
      : t("discount.fixed", { value: offer.discount_value });
  };

  const getAppliesText = (offer: any) => {
    switch (offer.applies_to) {
      case "all":
        return t("appliesTo.all");
      case "category":
        return t("appliesTo.category");
      case "product":
        return t("appliesTo.product");
      default:
        return "";
    }
  };

  const filteredOffers = offers.filter((offer) => {
    const title = getLocalizedTitle(offer);
    const description = getLocalizedDescription(offer);

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "all") return matchesSearch;

    const status = getOfferStatus(offer);
    return matchesSearch && status === filterStatus;
  });

  const getStatsCount = (status: string) => {
    if (status === "all") return offers.length;
    return offers.filter((offer) => getOfferStatus(offer) === status).length;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("page.title")}
            </h1>
            <p className="text-muted-foreground">{t("page.subtitle")}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-sm">
                <Plus className="h-4 w-4" />
                {t("actions.add")}
              </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("form.createTitle")}</DialogTitle>
              </DialogHeader>
              <OfferForm onSave={handleSave} onCancel={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("stats.total")}
                  </p>
                  <p className="text-2xl font-bold">{getStatsCount("all")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("stats.active")}
                  </p>
                  <p className="text-2xl font-bold">
                    {getStatsCount("active")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("stats.scheduled")}
                  </p>
                  <p className="text-2xl font-bold">
                    {getStatsCount("scheduled")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-500/10 rounded-lg">
                  <XCircle className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("stats.inactive")}
                  </p>
                  <p className="text-2xl font-bold">
                    {getStatsCount("inactive") + getStatsCount("expired")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {t("filter.label")}
                {filterStatus !== "all" && (
                  <Badge variant="secondary" className="ml-1">
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                {t("filter.all")} ({getStatsCount("all")})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                {t("filter.active")} ({getStatsCount("active")})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("scheduled")}>
                {t("filter.scheduled")} ({getStatsCount("scheduled")})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("inactive")}>
                {t("filter.inactive")} (
                {getStatsCount("inactive") + getStatsCount("expired")})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />

      {/* Offers Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Target className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("empty.title")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("empty.description")}
            </p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("empty.createFirst")}
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => {
            const status = getOfferStatus(offer);
            const localizedTitle = getLocalizedTitle(offer);
            const localizedDescription = getLocalizedDescription(offer);

            return (
              <Card
                key={offer.id}
                className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {localizedTitle}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {localizedDescription}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(offer)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          {t("actions.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(offer)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {t("actions.duplicate")}
                        </DropdownMenuItem>
                        <Separator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("actions.delete")}
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t("delete.title")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("delete.description", {
                                  title: localizedTitle,
                                })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t("actions.cancel")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteOffer(offer.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t("actions.delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Discount Display */}
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {offer.discount_type === "percentage" ? (
                        <Percent className="h-4 w-4 text-primary" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("card.discount")}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {getDiscountDisplay(offer)}
                      </p>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <p>{t("card.period")}</p>
                      <p className="font-medium">
                        {new Date(offer.start_date).toLocaleDateString()} -{" "}
                        {new Date(offer.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Applies To */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <div>
                      <p>{t("card.appliesTo")}</p>
                      <p className="font-medium">{getAppliesText(offer)}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(offer)}
                      className="gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      {t("actions.edit")}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(offer)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("delete.title")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("delete.description", {
                                title: localizedTitle,
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("actions.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteOffer(offer.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t("actions.delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="!max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("form.editTitle")}</DialogTitle>
          </DialogHeader>
          {selected && (
            <OfferForm
              initialData={selected}
              onSave={handleUpdate}
              onCancel={() => {
                setEditOpen(false);
                setSelected(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
