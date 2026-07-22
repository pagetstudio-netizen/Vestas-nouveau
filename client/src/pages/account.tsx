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

import robotImg      from "@assets/ai-robot-typing-on-ipad-isolated-on-transparent-background-fre_1784755325508.png";
import doosanLogo    from "@assets/channels4_profile_1784755325592.jpg";
import iconBell      from "@assets/d68b81d4-3a8a-4ba0-804f-d77f381cb5ab_1784755516755.png";
import iconGiftNew   from "@assets/0dbab192-27c3-4e50-8c09-17603ef394d1_1784755516794.png";
import bgMachinery   from "@assets/téléchargement_(20)_1784755537225.jpeg";
import bgCorporate   from "@assets/téléchargement_(15)_1784755566226.jpeg";

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

const WHITE      = "brightness(0) invert(1)";
const BLUE_ICO   = "brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(900%) hue-rotate(188deg)";
/* Bell : gold/amber to stand out on dark background */
const BELL_COLOR = "brightness(0) saturate(100%) invert(78%) sepia(80%) saturate(600%) hue-rotate(5deg) brightness(105%)";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");

  const { data: products } = useQuery<any[]>({ queryKey: ["/api/user-products"] });
  const { data: settings } = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });

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

  const balance        = parseFloat(user.balance || "0");
  const totalEarnings  = products?.reduce((s: number, p: any) => s + parseFloat(p.dailyIncome || "0"), 0) || 0;
  const activeProducts = products?.length ?? 0;
  const country        = getCountryByCode(user.country);
  const currency       = country?.currency || "FCFA";
  const phonePrefix    = country?.phonePrefix || "";
  const noticeText     = settings?.noticeText ||
    "Bienvenue sur Doosan Robotics ! Investissez dans nos robots industriels et générez des revenus quotidiens.";

  const menuItems = [
    { icon: doosanLogo,    label: "Mes robots",              href: "/invest",          isLogo: true  },
    { icon: iconSalaire,   label: "Récompense Salariale",    href: "/salary-bonus",    isLogo: false },
    { icon: iconWallet,    label: "Ma carte bancaire",        href: "/wallet",          isLogo: false },
    { icon: iconChangePwd, label: "Sécurité",                href: "/change-password", isLogo: false },
    { icon: iconAbout,     label: "À propos de nous",        href: "/about",           isLogo: false },
    { icon: iconRecords,   label: "Règles de la plateforme", href: "/rules",           isLogo: false },
    { icon: iconCS,        label: "Service client",          href: "/service",         isLogo: false },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Keyframe for marquee — injected inline so no extra CSS file needed */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .marquee-track { animation: marquee 22s linear infinite; white-space: nowrap; }
      `}</style>

      <div className="flex-1 overflow-y-auto pb-24">

        {/* ═══ HERO — black section ═══ */}
        <div className="relative overflow-hidden" style={{ background: "#0a0a0a", minHeight: 270 }}>
          <img
            src={robotImg}
            alt="robot"
            className="absolute bottom-0 right-0 pointer-events-none select-none"
            style={{ height: 245, width: "auto", objectFit: "contain", opacity: 0.92 }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(90deg, #0a0a0a 52%, transparent 100%)" }}
          />
          <div className="relative z-10 px-5 pt-6">
            {/* Top row */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-white font-extrabold text-2xl tracking-wide">Le mien</p>
              <img src={iconSalaire} alt="" className="w-7 h-7 object-contain" style={{ filter: WHITE }} />
            </div>
            {/* Profile row */}
            <div className="flex items-center gap-3 mb-5">
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
            {/* Balance headline */}
            <div className="mb-4">
              <p className="text-white font-extrabold text-3xl leading-none" data-testid="text-balance">
                {currency} {balance.toFixed(2)}
              </p>
              <p className="text-white/50 text-sm mt-1">Solde du compte</p>
            </div>
          </div>
        </div>

        {/* ═══ 4 action buttons ═══ */}
        <div
          className="mx-4 mt-3 rounded-2xl grid grid-cols-4"
          style={{ background: "#111", border: "1px solid #222" }}
        >
          {[
            { icon: iconRecharger, label: "Recharger",      href: "/deposit"    },
            { icon: iconRetraits,  label: "Retirer",        href: "/withdrawal" },
            { icon: iconRecords,   label: "Registres",      href: "/history"    },
            { icon: iconGiftNew,   label: "Code cadeau",    href: "/gift-code", raw: true },
          ].map((item, i) => (
            <Link href={item.href} key={i}>
              <button className="flex flex-col items-center justify-center gap-2 py-4 w-full active:bg-white/5 rounded-2xl">
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-8 h-8 object-contain"
                  style={item.raw ? {} : { filter: WHITE }}
                />
                <span className="text-white/80 text-[10px] font-medium text-center leading-tight px-0.5">{item.label}</span>
              </button>
            </Link>
          ))}
        </div>

        {/* ═══ Scrolling notification ticker ═══ */}
        <div
          className="mx-4 mt-3 rounded-xl overflow-hidden flex items-center gap-3 px-3 py-2.5"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
        >
          <img
            src={iconBell}
            alt="notif"
            className="w-5 h-5 object-contain shrink-0"
            style={{ filter: BELL_COLOR }}
          />
          <div className="flex-1 overflow-hidden">
            <p className="marquee-track text-white/80 text-xs font-medium">
              {noticeText}
            </p>
          </div>
        </div>

        {/* ═══ Large balance cards with background images ═══ */}
        <div className="mx-4 mt-3 grid grid-cols-2 gap-3">

          {/* Card 1 — Solde (machinery background, large) */}
          <div
            className="rounded-2xl overflow-hidden relative col-span-1"
            style={{ height: 170 }}
          >
            <img src={bgMachinery} alt="" className="absolute inset-0 w-full h-full object-cover" />
            {/* Dark overlay */}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(160deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 100%)" }}
            />
            <div className="relative z-10 p-4 flex flex-col justify-between h-full">
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">Balance</p>
              <div>
                <p className="text-white font-extrabold text-xl leading-tight" data-testid="text-balance-card">
                  {balance.toFixed(2)}
                </p>
                <p className="text-white/70 text-[11px] mt-0.5">{currency}</p>
              </div>
            </div>
          </div>

          {/* Right column — 2 stacked cards */}
          <div className="flex flex-col gap-3">

            {/* Card 2 — Revenus cumulatifs (corporate background) */}
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{ height: 80 }}
            >
              <img src={bgCorporate} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
              <div
                className="absolute inset-0"
                style={{ background: "rgba(0,0,0,0.55)" }}
              />
              <div className="relative z-10 p-3 flex flex-col justify-between h-full">
                <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wide">Cumulatif</p>
                <p className="text-white font-extrabold text-base leading-none" data-testid="text-earnings-card">
                  {totalEarnings.toFixed(2)} <span className="text-[10px] font-normal text-white/70">{currency}</span>
                </p>
              </div>
            </div>

            {/* Card 3 — Produits actifs (dark solid) */}
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{ height: 80, background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)" }}
            >
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 70% 30%, #fff 0%, transparent 60%)" }} />
              <div className="relative z-10 p-3 flex flex-col justify-between h-full">
                <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wide">Produits actifs</p>
                <p className="text-white font-extrabold text-2xl leading-none">{activeProducts}</p>
              </div>
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
                className="text-white font-bold text-sm px-3 py-1 rounded-lg shrink-0"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                Aller
              </span>
            </div>
          </button>
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
                        style={{ filter: BLUE_ICO }} />
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
