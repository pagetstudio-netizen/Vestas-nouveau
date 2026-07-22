import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";
import { Loader2, Shield, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import robotImg    from "@assets/ai-robot-typing-on-ipad-isolated-on-transparent-background-fre_1784755325508.png";
import doosanLogo  from "@assets/channels4_profile_1784755325592.jpg";

import iconRecords    from "@assets/mine-mod-records-DgHXSKa1_1782689837747.png";
import iconGift       from "@assets/téléchargement_(66)_1782689859239.png";
import iconAbout      from "@assets/mine-mod-aboutus-xnaBhqOq_1782689895455.png";
import iconCS         from "@assets/mine-mod-cs-DtBQ0Sp0_1782689895410.png";
import iconWithdraw   from "@assets/withdraw-icon-DFsum39V_(1)_1782689895379.png";
import iconChangePwd  from "@assets/mine-mod-change-pwd-D4tL_Aft_1782689895436.png";
import iconWallet     from "@assets/portefeuille-chaud-3d-icon-png-download-9878550_1783248791774.png";
import iconRevenu     from "@assets/3309927_1783248791847.png";
import iconSalaire    from "@assets/téléchargement_(63)_1783248791872.png";
import iconRecharger  from "@assets/1-1_1783245823715.png";
import iconRetraits   from "@assets/2-1_1783245823825.png";

const WHITE = "brightness(0) invert(1)";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");

  const { data: products } = useQuery<any[]>({ queryKey: ["/api/user-products"] });
  const { data: settings }  = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });

  const verifyPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      const res = await apiRequest("POST", "/api/admin/verify-pin", { pin });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Code PIN incorrect"); }
      return res.json();
    },
    onSuccess: () => { setShowPinModal(false); setAdminPin(""); navigate("/admin"); },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const handleAdminClick = () => {
    if (user?.isAdminPasswordRequired === false) { navigate("/admin"); return; }
    setShowPinModal(true);
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };

  if (!user) return null;

  const balance       = parseFloat(user.balance || "0");
  const totalEarnings = products?.reduce((s: number, p: any) => s + parseFloat(p.dailyIncome || "0"), 0) || 0;
  const country       = getCountryByCode(user.country);
  const currency      = country?.currency || "FCFA";
  const phonePrefix   = country?.phonePrefix || "";

  /* ── list menu items ─────────────────────────────────────── */
  const menuItems = [
    { icon: doosanLogo,   label: "Mes robots",              href: "/invest",           isLogo: true },
    { icon: iconSalaire,  label: "Récompense Salariale",    href: "/salary-bonus",     isLogo: false },
    { icon: iconGift,     label: "Échangeur de codes",      href: "/gift-code",        isLogo: false },
    { icon: iconWallet,   label: "Ma carte bancaire",       href: "/wallet",           isLogo: false },
    { icon: iconChangePwd,label: "Sécurité",                href: "/change-password",  isLogo: false },
    { icon: iconAbout,    label: "À propos de nous",        href: "/about",            isLogo: false },
    { icon: iconRecords,  label: "Règles de la plateforme", href: "/rules",            isLogo: false },
    { icon: iconCS,       label: "Service client",          href: "/service",          isLogo: false },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <div className="flex-1 overflow-y-auto pb-24">

        {/* ═══ HERO — black section ═══ */}
        <div className="relative overflow-hidden" style={{ background: "#0a0a0a", minHeight: 260 }}>

          {/* Robot image — right side, large, cropped */}
          <img
            src={robotImg}
            alt="robot"
            className="absolute bottom-0 right-0 pointer-events-none select-none"
            style={{ height: 230, width: "auto", objectFit: "contain", opacity: 0.92 }}
          />

          {/* Subtle gradient overlay so left text is readable */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(90deg, #0a0a0a 55%, transparent 100%)" }}
          />

          {/* Content */}
          <div className="relative z-10 px-5 pt-6">

            {/* Top row */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-white font-extrabold text-2xl tracking-wide">Le mien</p>
              <img src={iconSalaire} alt="" className="w-7 h-7 object-contain" style={{ filter: WHITE }} />
            </div>

            {/* Profile row */}
            <div className="flex items-center gap-3 mb-5">
              {/* Doosan logo circle */}
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/30 shrink-0 bg-[#1565C0]">
                <img src={doosanLogo} alt="Doosan" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight tracking-wide">
                  {phonePrefix} {user.phone}
                </p>
                <p className="text-white/50 text-xs mt-0.5">ID : {user.referralCode}</p>
              </div>
            </div>

            {/* Balance */}
            <div className="mb-4">
              <p className="text-white font-extrabold text-3xl leading-none" data-testid="text-balance">
                {currency} {balance.toFixed(2)}
              </p>
              <p className="text-white/50 text-sm mt-1">Solde du compte</p>
            </div>
          </div>
        </div>

        {/* ═══ "Mon appareil" banner card ═══ */}
        <div className="px-4 mt-3">
          <button
            onClick={() => navigate("/invest")}
            className="w-full rounded-2xl overflow-hidden text-left active:opacity-80 transition-opacity flex items-center justify-between px-4 py-4"
            style={{ background: "linear-gradient(120deg, #1a1a1a 0%, #222 100%)", border: "1px solid #333" }}
          >
            <div className="flex-1">
              <p className="text-white font-bold text-base leading-tight">Mon appareil</p>
              <p className="text-white/50 text-xs mt-1">Afficher les revenus de mon appareil</p>
            </div>
            <div className="flex items-center gap-3">
              <img src={robotImg} alt="" className="w-14 h-14 object-contain" style={{ opacity: 0.85 }} />
              <span
                className="text-white font-bold text-sm px-3 py-1 rounded-lg"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                Aller
              </span>
            </div>
          </button>
        </div>

        {/* ═══ 3 action buttons ═══ */}
        <div
          className="mx-4 mt-3 rounded-2xl grid grid-cols-3"
          style={{ background: "#111", border: "1px solid #222" }}
        >
          {[
            { icon: iconRecharger, label: "Recharger",             href: "/deposit"  },
            { icon: iconWithdraw,  label: "Retirer de l'argent",   href: "/withdrawal" },
            { icon: iconRecords,   label: "Registres de comptes",  href: "/history"  },
          ].map((item, i) => (
            <Link href={item.href} key={i}>
              <button className="flex flex-col items-center justify-center gap-2 py-5 w-full active:bg-white/5 rounded-2xl">
                <img src={item.icon} alt={item.label} className="w-8 h-8 object-contain" style={{ filter: WHITE }} />
                <span className="text-white/80 text-[11px] font-medium text-center leading-tight px-1">{item.label}</span>
              </button>
            </Link>
          ))}
        </div>

        {/* ═══ White list section ═══ */}
        <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm mb-3">
          {menuItems.map((item, i) => (
            <Link href={item.href} key={i}>
              <button
                className="w-full flex items-center justify-between px-5 py-4 active:bg-gray-50 transition-colors"
                style={{ borderBottom: i < menuItems.length - 1 ? "1px solid #f0f0f0" : "none" }}
              >
                <div className="flex items-center gap-3">
                  {item.isLogo ? (
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                      <img src={item.icon} alt={item.label} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 flex items-center justify-center shrink-0">
                      <img src={item.icon} alt={item.label} className="w-7 h-7 object-contain"
                        style={{ filter: "brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(900%) hue-rotate(188deg)" }} />
                    </div>
                  )}
                  <span className="text-gray-800 font-medium text-[15px]">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </Link>
          ))}
        </div>

        {/* ═══ Déconnexion ═══ */}
        <div className="mx-4 mb-3">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl text-sm font-bold bg-white text-[#1565C0] border-2 border-[#1565C0] active:bg-blue-50"
            data-testid="button-logout"
          >
            Déconnexion
          </button>
        </div>

        {/* ═══ Admin button ═══ */}
        {user.isAdmin && (
          <div className="mx-4 mb-4">
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
              style={{ background: "linear-gradient(135deg, #003366, #002244)" }}
              data-testid="button-admin"
            >
              <Shield className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-sm">Panel Admin</span>
            </button>
          </div>
        )}

      </div>

      {/* ═══ Admin PIN modal ═══ */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Code d'accès administrateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Entrez votre code PIN pour accéder au panel administrateur
            </p>
            <Input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="Code PIN"
              className="text-center text-2xl tracking-widest"
              maxLength={8}
              data-testid="input-admin-pin"
            />
            <Button
              onClick={() => {
                if (adminPin.length < 4) {
                  toast({ title: "Le code PIN doit contenir au moins 4 caractères", variant: "destructive" });
                  return;
                }
                verifyPinMutation.mutate(adminPin);
              }}
              disabled={verifyPinMutation.isPending || adminPin.length < 4}
              className="w-full"
              style={{ backgroundColor: "#1565C0" }}
              data-testid="button-verify-pin"
            >
              {verifyPinMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
