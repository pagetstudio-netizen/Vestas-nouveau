import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { ChevronLeft, Loader2, RefreshCw } from "lucide-react";
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
const CARD_GREEN = "#3d9e4e";

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

/** Mask a reference: keep first 2 and last 4 chars, replace middle with **** */
const maskRef = (ref: string) => {
  if (ref.length <= 6) return ref;
  return ref.slice(0, 2) + "****" + ref.slice(-4);
};

const formatDateTime = (dateString: string) => {
  const d = new Date(dateString);
  const dd   = String(d.getDate()).padStart(2, "0");
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh   = String(d.getHours()).padStart(2, "0");
  const min  = String(d.getMinutes()).padStart(2, "0");
  const ss   = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "completed":
    case "approved":
      return { label: "Approuvé",      color: "#16a34a" };
    case "rejected":
      return { label: "Rejeté",        color: "#dc2626" };
    case "processing":
      return { label: "En traitement", color: "#d97706" };
    default:
      return { label: "En attente...", color: "#d97706" };
  }
};

/* Divider */
const Divider = () => (
  <div style={{ height: 1, background: "#f0f0f0", margin: "0 16px" }} />
);

/* Row */
const Row = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
  <div className="flex items-center justify-between px-4" style={{ paddingTop: 7, paddingBottom: 7 }}>
    <span style={{ color: "#9ca3af", fontSize: 13 }}>{label}</span>
    <span style={{ color: valueColor ?? "#374151", fontSize: 13, fontWeight: 500 }}>{value}</span>
  </div>
);

export default function HistoryPage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">("deposits");
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const isAdmin = !!(user as any)?.isAdmin;

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

      {/* ── Tabs ── */}
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
      <div
        className="flex-1 overflow-y-auto pb-8 space-y-3 pt-3"
        style={{ background: "#f0f2f5", borderRadius: "16px 16px 0 0", marginTop: 2, paddingLeft: 10, paddingRight: 10 }}
      >
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>

        ) : (activeTab === "deposits" ? deposits : withdrawals).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <img src={nodataImg} alt="Aucune donnée" className="w-28 h-28 object-contain opacity-90" />
            <p className="text-gray-400 text-sm">Plus de données</p>
          </div>

        ) : activeTab === "deposits" ? (
          deposits.map((deposit) => {
            const { label: statusLabel, color: statusColor } = getStatusInfo(deposit.status);
            const ref = getDepositRef(deposit);
            const displayRef = isAdmin ? ref : maskRef(ref);
            const amt = parseFloat(deposit.amount);
            return (
              <div
                key={deposit.id}
                className="rounded-xl overflow-hidden shadow-sm"
                style={{ background: "#fff", border: "1px solid #e8e8e8" }}
                data-testid={`deposit-item-${deposit.id}`}
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Dépôt</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: CARD_GREEN }}>
                    {currency} {amt.toLocaleString("fr-FR")}
                  </span>
                </div>

                <Divider />

                <Row label="Numéro" value={displayRef} />
                <Divider />
                <Row label="Un résultat" value={statusLabel} valueColor={statusColor} />
                <Divider />
                <Row label="Temps" value={formatDateTime(deposit.createdAt)} />

                {/* Verify button — only for non-auto pending deposits */}
                {isPendingDeposit(deposit) && !deposit.sendavapayReference && (
                  <>
                    <Divider />
                    <div className="px-4 py-3">
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
                  </>
                )}
              </div>
            );
          })

        ) : (
          withdrawals.map((withdrawal) => {
            const { label: statusLabel, color: statusColor } = getStatusInfo(withdrawal.status);
            const ref = getWithdrawalRef(withdrawal);
            const displayRef = isAdmin ? ref : maskRef(ref);
            const gross = parseFloat(withdrawal.amount);
            const net   = parseFloat(withdrawal.netAmount ?? withdrawal.amount);
            return (
              <div
                key={withdrawal.id}
                className="rounded-xl overflow-hidden shadow-sm"
                style={{ background: "#fff", border: "1px solid #e8e8e8" }}
                data-testid={`withdrawal-item-${withdrawal.id}`}
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Retrait</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: CARD_GREEN }}>
                    {currency} {gross.toLocaleString("fr-FR")}
                  </span>
                </div>

                <Divider />

                <Row label="Montant reçu" value={`${currency} ${net.toLocaleString("fr-FR")}`} />
                <Divider />
                <Row label="Compte" value={displayRef} />
                <Divider />
                <Row label="Un résultat" value={statusLabel} valueColor={statusColor} />
                <Divider />
                <Row label="Temps" value={formatDateTime(withdrawal.createdAt)} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
