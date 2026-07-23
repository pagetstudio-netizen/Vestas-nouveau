import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { ChevronLeft, Loader2, RefreshCw, Copy } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

import nodataImg from "@assets/nodata-da225bbb_(1)_1783249133513.png";

interface Deposit {
  id: number;
  userId: number;
  amount: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  soleaspayReference?: string;
  soleaspayOrderId?: string;
  omnipayId?: string;
  omnipayReference?: string;
  sendavapayReference?: string;
}

interface Withdrawal {
  id: number;
  userId: number;
  amount: string;
  netAmount: string;
  status: string;
  createdAt: string;
  sendavapayReference?: string;
}

const BG = "linear-gradient(160deg, #1565C0 0%, #1976D2 70%, #1E88E5 100%)";

/* Generate a reference starting with "sdk" */
const makeRef = (prefix: "D" | "W", id: number, date: string) => {
  const d = new Date(date);
  const yy  = String(d.getFullYear()).slice(2);
  const mm  = String(d.getMonth() + 1).padStart(2, "0");
  const dd  = String(d.getDate()).padStart(2, "0");
  const hh  = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const seq = String(id).padStart(4, "0");
  return `sdk${yy}${mm}${dd}${hh}${min}${prefix}${seq}`;
};

const getDepositRef = (d: Deposit) => {
  if (d.sendavapayReference) return d.sendavapayReference.startsWith("sdk") ? d.sendavapayReference : `sdk${d.sendavapayReference}`;
  if (d.omnipayReference)    return d.omnipayReference.startsWith("sdk")    ? d.omnipayReference    : `sdk${d.omnipayReference}`;
  if (d.omnipayId)           return `sdk${d.omnipayId}`;
  if (d.soleaspayReference)  return d.soleaspayReference.startsWith("sdk")  ? d.soleaspayReference  : `sdk${d.soleaspayReference}`;
  if (d.soleaspayOrderId)    return `sdk${d.soleaspayOrderId}`;
  return makeRef("D", d.id, d.createdAt);
};

const getWithdrawalRef = (w: Withdrawal) => {
  if (w.sendavapayReference) return w.sendavapayReference.startsWith("sdk") ? w.sendavapayReference : `sdk${w.sendavapayReference}`;
  return makeRef("W", w.id, w.createdAt);
};

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  const mm  = String(d.getMonth() + 1).padStart(2, "0");
  const dd  = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh  = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss  = String(d.getSeconds()).padStart(2, "0");
  return `${mm}/${dd}/${yyyy} ${hh}:${min}:${ss}`;
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "completed":
    case "approved":
      return { label: "Approuvé",       textColor: "#16a34a", badgeBg: "#dcfce7", badgeText: "#15803d" };
    case "rejected":
      return { label: "Rejeté",         textColor: "#dc2626", badgeBg: "#fee2e2", badgeText: "#b91c1c" };
    case "processing":
      return { label: "En traitement",  textColor: "#d97706", badgeBg: "#fef3c7", badgeText: "#b45309" };
    default:
      return { label: "En attente...",  textColor: "#d97706", badgeBg: "#fef3c7", badgeText: "#b45309" };
  }
};

const CARD_GREEN = "#3d9e4e";

function copyToClipboard(text: string, toast: ReturnType<typeof useToast>["toast"]) {
  navigator.clipboard.writeText(text).then(() =>
    toast({ title: "Copié !", description: text, duration: 1500 })
  );
}

const formatDateShort = (dateString: string) => {
  const d = new Date(dateString);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};

export default function HistoryPage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">("deposits");
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const countryInfo = user ? getCountryByCode(user.country) : null;
  const currency = countryInfo?.currency || "FCFA";

  const { data: deposits = [], isLoading: depositsLoading } = useQuery<Deposit[]>({
    queryKey: ["/api/deposits/history"],
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals/history"],
  });

  const isPendingDeposit = (deposit: Deposit) =>
    (deposit.status === "pending" || deposit.status === "processing") &&
    (deposit.soleaspayReference || deposit.soleaspayOrderId || deposit.omnipayId || deposit.omnipayReference || deposit.sendavapayReference);

  const handleVerify = async (depositId: number) => {
    setVerifyingId(depositId);
    try {
      const res = await fetch(`/api/deposits/${depositId}/verify`, { credentials: "include" });
      const data = await res.json();
      if (data.status === "approved") {
        toast({ title: "Paiement confirmé", description: "Votre compte a été crédité" });
        refreshUser();
        queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
      } else if (data.status === "rejected") {
        toast({ title: "Paiement échoué", description: "Le paiement a été refusé", variant: "destructive" });
        queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
      } else {
        toast({ title: "En cours", description: "Le paiement est toujours en attente" });
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de vérifier le paiement", variant: "destructive" });
    } finally {
      setVerifyingId(null);
    }
  };

  if (!user) return null;

  const isLoading = activeTab === "deposits" ? depositsLoading : withdrawalsLoading;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: BG }}>

      {/* ── Header ── */}
      <div className="flex items-center px-4 pt-6 pb-4 gap-3">
        <Link href="/account">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </Link>
        <p className="flex-1 text-center text-white font-extrabold text-lg pr-9">Historique</p>
      </div>

      {/* ── Tabs — gauche / droite bord écran ── */}
      <div className="flex mb-4">
        <button
          onClick={() => setActiveTab("deposits")}
          className="flex-1 py-3 font-bold text-base transition-all"
          style={{
            color: activeTab === "deposits" ? "#fff" : "rgba(255,255,255,0.5)",
            borderBottom: activeTab === "deposits" ? "3px solid #fff" : "3px solid transparent",
          }}
          data-testid="tab-deposits"
        >
          Dépôt
        </button>
        <button
          onClick={() => setActiveTab("withdrawals")}
          className="flex-1 py-3 font-bold text-base transition-all"
          style={{
            color: activeTab === "withdrawals" ? "#fff" : "rgba(255,255,255,0.5)",
            borderBottom: activeTab === "withdrawals" ? "3px solid #fff" : "3px solid transparent",
          }}
          data-testid="tab-withdrawals"
        >
          Retrait
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3" style={{ background: "#f0f2f5", borderRadius: "16px 16px 0 0", marginTop: 2 }}>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>

        ) : (activeTab === "deposits" ? deposits : withdrawals).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <img src={nodataImg} alt="Aucune donnée" className="w-28 h-28 object-contain opacity-90" />
            <p className="text-white/70 text-sm">Aucune transaction pour le moment</p>
          </div>

        ) : activeTab === "deposits" ? (
          deposits.map((deposit) => {
            const { label: statusLabel, badgeBg, badgeText } = getStatusInfo(deposit.status);
            const ref = getDepositRef(deposit);
            const amt = parseFloat(deposit.amount);
            return (
              <div
                key={deposit.id}
                className="rounded-xl overflow-hidden shadow-md"
                style={{ background: "#fff", border: "1px solid #e5e7eb" }}
                data-testid={`deposit-item-${deposit.id}`}
              >
                {/* Green header — reference + copy icon */}
                <div
                  className="flex items-center gap-2 px-4 py-2.5"
                  style={{ background: CARD_GREEN }}
                >
                  <span className="text-white text-xs font-semibold shrink-0">Numéro de commande:</span>
                  <span className="text-white text-xs font-bold flex-1 min-w-0 truncate">{ref}</span>
                  <button
                    onClick={() => copyToClipboard(ref, toast)}
                    className="shrink-0 text-white/80 hover:text-white active:scale-95 transition-transform"
                    data-testid={`button-copy-${deposit.id}`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Montant</span>
                    <span className="text-red-500 font-bold text-sm">
                      {amt.toLocaleString("fr-FR")} {currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Condition</span>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full max-w-[130px] truncate"
                      style={{ background: badgeBg, color: badgeText }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Date</span>
                    <span className="text-gray-700 text-sm font-medium">{formatDateShort(deposit.createdAt)}</span>
                  </div>
                </div>

                {isPendingDeposit(deposit) && !deposit.sendavapayReference && (
                  <div className="px-4 pb-3">
                    <button
                      onClick={() => handleVerify(deposit.id)}
                      disabled={verifyingId === deposit.id}
                      className="w-full py-2 text-white text-xs font-bold rounded-full flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: CARD_GREEN }}
                      data-testid={`button-verify-${deposit.id}`}
                    >
                      {verifyingId === deposit.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <RefreshCw className="w-3.5 h-3.5" />}
                      Vérifier la transaction
                    </button>
                  </div>
                )}
              </div>
            );
          })

        ) : (
          withdrawals.map((withdrawal) => {
            const { label: statusLabel, badgeBg, badgeText } = getStatusInfo(withdrawal.status);
            const ref = getWithdrawalRef(withdrawal);
            const gross = parseFloat(withdrawal.amount);
            return (
              <div
                key={withdrawal.id}
                className="rounded-xl overflow-hidden shadow-md"
                style={{ background: "#fff", border: "1px solid #e5e7eb" }}
                data-testid={`withdrawal-item-${withdrawal.id}`}
              >
                {/* Green header — reference + copy icon */}
                <div
                  className="flex items-center gap-2 px-4 py-2.5"
                  style={{ background: CARD_GREEN }}
                >
                  <span className="text-white text-xs font-semibold shrink-0">Numéro de commande:</span>
                  <span className="text-white text-xs font-bold flex-1 min-w-0 truncate">{ref}</span>
                  <button
                    onClick={() => copyToClipboard(ref, toast)}
                    className="shrink-0 text-white/80 hover:text-white active:scale-95 transition-transform"
                    data-testid={`button-copy-w-${withdrawal.id}`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Montant</span>
                    <span className="text-red-500 font-bold text-sm">
                      {gross.toLocaleString("fr-FR")} {currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Condition</span>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full max-w-[130px] truncate"
                      style={{ background: badgeBg, color: badgeText }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Date</span>
                    <span className="text-gray-700 text-sm font-medium">{formatDateShort(withdrawal.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
