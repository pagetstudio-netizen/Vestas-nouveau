import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, getCountryByCode } from "@/lib/countries";
import { Loader2, AlertTriangle, Settings } from "lucide-react";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";

import vestasLogo  from "@assets/6790d8bd04714fedd7593cb6_Doosan_Group_and_Corporation_-_Logo.s_1784561452870.png";
import serviceIcon from "@assets/20260311_214852_1773265973964.png";
import productImg1 from "@assets/téléchargement_(16)_1784561452683.jpeg";
import productImg2 from "@assets/téléchargement_(20)_1784561452229.jpeg";
import productImg3 from "@assets/téléchargement_(19)_1784561452588.jpeg";
import productImg4 from "@assets/images_(50)_1783210180466.jpeg";
import productImg5 from "@assets/images_(41)_1783210181134.jpeg";
import productImg6 from "@assets/images_(49)_1783210181155.jpeg";
import productImg7 from "@assets/images_(40)_1783210181193.jpeg";
import productImg8 from "@assets/images_(39)_1783210181215.jpeg";

const PRODUCT_IMAGES = [
  productImg1, productImg2, productImg3, productImg4,
  productImg5, productImg6, productImg7, productImg8,
];

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  canClaimFree: boolean;
  ownedCount?: number;
}

export default function InvestPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [confirmProduct, setConfirmProduct] = useState<ProductWithOwnership | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");

  const { data: products, isLoading } = useQuery<ProductWithOwnership[]>({
    queryKey: ["/api/products"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("POST", `/api/products/${productId}/purchase`, {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/products"] });
      refreshUser();
      setConfirmProduct(null);
      toast({ title: "Produit acheté !", description: "Vous commencerez à recevoir des gains demain." });
    },
    onError: (error: any) => {
      setConfirmProduct(null);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  const balance     = parseFloat(user.balance || "0");
  const country     = getCountryByCode(user.country);
  const currency    = country?.currency || "FCFA";
  const paidProducts = products?.filter(p => !p.isFree) || [];
  const myProducts   = paidProducts.filter(p => p.isOwned);
  const displayed    = activeTab === "all" ? paidProducts : myProducts;

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#f0f2f5" }}>

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 shadow-sm"
        style={{ background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)" }}
      >
        <img
          src={vestasLogo}
          alt="Doosan"
          className="h-8 w-auto object-contain"
          style={{ filter: "brightness(0) invert(1)" }}
        />
        <button
          onClick={() => navigate("/service")}
          className="flex items-center justify-center"
          data-testid="button-service"
        >
          <img src={serviceIcon} alt="Service client" className="w-8 h-8 object-contain" />
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className="px-5 py-2 rounded-full font-bold text-sm transition-all"
          style={{
            background: activeTab === "all"
              ? "linear-gradient(135deg, #16a34a, #22c55e)"
              : "linear-gradient(135deg, #bbf7d0, #86efac)",
            color: activeTab === "all" ? "#fff" : "#15803d",
          }}
        >
          our products
        </button>
        <button
          onClick={() => setActiveTab("mine")}
          className="px-5 py-2 rounded-full font-bold text-sm transition-all"
          style={{
            background: activeTab === "mine"
              ? "linear-gradient(135deg, #16a34a, #22c55e)"
              : "linear-gradient(135deg, #bbf7d0, #86efac)",
            color: activeTab === "mine" ? "#fff" : "#15803d",
          }}
        >
          my product
        </button>
      </div>

      {/* ── Product list ── */}
      <div className="flex-1 overflow-y-auto pb-24 px-3 space-y-3 pt-1">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
        ) : displayed.length > 0 ? (
          displayed.map((product, idx) => {
            const img = PRODUCT_IMAGES[idx % PRODUCT_IMAGES.length];
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden flex"
                data-testid={`product-card-${product.id}`}
              >
                {/* Left — product image */}
                <div className="shrink-0" style={{ width: 150, minHeight: 160 }}>
                  <img
                    src={img}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    style={{ minHeight: 160 }}
                  />
                </div>

                {/* Right — info */}
                <div className="flex-1 flex flex-col px-3 pt-3 pb-3 min-w-0">
                  {/* Name + Acheter */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-black text-gray-900 text-base leading-tight">{product.name}</p>
                    <button
                      onClick={() => setConfirmProduct(product)}
                      className="shrink-0 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow"
                      style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)" }}
                      data-testid={`button-purchase-${product.id}`}
                    >
                      Acheter
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="space-y-1 mt-auto">
                    {[
                      { label: "Prix unitaire",    value: `${currency} ${Number(product.price).toLocaleString("fr-FR")}` },
                      { label: "Validité",         value: `${product.cycleDays} Jours` },
                      { label: "Gains quotidiens", value: `${currency} ${Number(product.dailyEarnings).toLocaleString("fr-FR")}` },
                      { label: "Revenu total",     value: `${currency} ${Number(product.totalReturn).toLocaleString("fr-FR")}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-gray-400 text-[11px]">{label}</span>
                        <span className="font-bold text-[11px]" style={{ color: "#1565C0" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">
              {activeTab === "mine" ? "Vous n'avez aucun produit actif" : "Aucun produit disponible"}
            </p>
          </div>
        )}
      </div>

      {/* ── Purchase confirm modal ── */}
      {confirmProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/50"
          onClick={() => setConfirmProduct(null)}
        >
          <div
            className="w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl bg-white"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-1 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Conseil</p>
              <p className="text-gray-800 font-semibold text-base leading-snug">
                Êtes-vous sûr de vouloir acheter ce produit ?
              </p>
              <p className="text-gray-500 text-xs mt-2">
                <span className="font-bold text-gray-700">{confirmProduct.name}</span>
                {" · "}{currency} {Number(confirmProduct.price).toLocaleString("fr-FR")}
              </p>
              {balance < confirmProduct.price && (
                <div className="flex items-center justify-center gap-1.5 mt-3 p-2 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Solde insuffisant — manque {formatCurrency(confirmProduct.price - balance, user.country)}
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 mt-5" />

            {/* Buttons */}
            <div className="flex">
              <button
                onClick={() => setConfirmProduct(null)}
                className="flex-1 py-4 font-semibold text-base text-gray-500 active:bg-gray-50 transition-colors"
                style={{ borderRight: "1px solid #f0f0f0" }}
                data-testid="button-cancel-purchase"
              >
                Non
              </button>
              <button
                onClick={() => purchaseMutation.mutate(confirmProduct.id)}
                disabled={purchaseMutation.isPending}
                className="flex-1 py-4 font-bold text-base text-white flex items-center justify-center gap-1.5 active:opacity-90 transition-opacity"
                style={{ background: "#22c55e" }}
                data-testid="button-confirm-purchase"
              >
                {purchaseMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : "Oui"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
