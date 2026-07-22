import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";
import { Loader2, Shield, ChevronRight, Info } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/* ── Assets ── */
import robotImg     from "@assets/ai-robot-typing-on-ipad-isolated-on-transparent-background-fre_1784757578287.png";
import doosanLogo   from "@assets/channels4_profile_1784757578321.jpg";
import iconRecords  from "@assets/mine-mod-records-DgHXSKa1_1782689837747.png";
import iconAbout    from "@assets/mine-mod-aboutus-xnaBhqOq_1782689895455.png";
import iconCS       from "@assets/mine-mod-cs-DtBQ0Sp0_1782689895410.png";
import iconChangePwd from "@assets/mine-mod-change-pwd-D4tL_Aft_1782689895436.png";
import iconWallet   from "@assets/mine-mod-bankcard-CLOhqwHj_1784762822542.png";
import iconSalaire  from "@assets/téléchargement_(63)_1783248791872.png";
import iconRecharger from "@assets/1-1_1783245823715.png";
import iconRetraits  from "@assets/2-1_1783245823825.png";

/* colour filters */
const WHITE    = "brightness(0) invert(1)";
const BLUE_ICO = "brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(900%) hue-rotate(188deg)";

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
    onError:   (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const handleAdminClick = () => {
    if (user?.isAdminPasswordRequired === false) { navigate("/admin"); return; }
    setShowPinModal(true);
  };
  const handleLogout = async () => { await logout(); navigate("/login"); };

  if (!user) return null;

  const balance    = parseFloat(user.balance || "0");
  const country    = getCountryByCode(user.country);
  const currency   = country?.currency || "FCFA";
  const phonePrefix = country?.phonePrefix || "";

  /* ── action buttons (row of 3) ── */
  const actionBtns = [
    { icon: iconRecharger, label: "Recharger",          href: "/deposit"    },
    { icon: iconRetraits,  label: "Retirer de l'argent", href: "/withdrawal" },
    { icon: iconRecords,   label: "Registres de comptes",href: "/history"    },
  ];

  /* ── menu list ── */
  const menuItems = [
    { icon: iconWallet,    label: "Ma carte bancaire",       href: "/wallet",          isLogo: false },
    { icon: iconChangePwd, label: "Sécurité",               href: "/change-password", isLogo: false },
    { icon: iconAbout,     label: "À propos de nous",        href: "/about",           isLogo: false },

    { icon: iconCS,        label: "Service client",          href: "/service",         isLogo: false },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f0f0]">
      <div className="flex-1 overflow-y-auto pb-24">

        {/* ══════════════════════════════════════════
            HERO — dark background, logo + balance left, robot right
        ══════════════════════════════════════════ */}
        <div
          className="relative w-full overflow-hidden"
          style={{ background: "#000" }}
        >
          {/* Content layer */}
          <div className="relative z-10 px-5 pt-6 pb-2 flex items-stretch justify-between">

            {/* LEFT: logo row + balance */}
            <div className="flex flex-col justify-between gap-3">
              {/* Logo + phone */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                  style={{ background: "#fff" }}
                >
                  <img src={doosanLogo} alt="Doosan" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-white/70 text-xs font-medium">{phonePrefix}</p>
                  <p className="text-white font-bold text-[17px] leading-tight">{user.phone}</p>
                </div>
              </div>

              {/* Balance */}
              <div className="mt-1">
                <p className="text-white font-extrabold text-3xl leading-none">
                  {currency} {balance.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}
                </p>
                <p className="text-white/50 text-xs mt-1">Solde du compte</p>
              </div>
            </div>

            {/* RIGHT: robot image with bottom fade */}
            <div className="relative" style={{ width: 140, height: 190 }}>
              <img
                src={robotImg}
                alt="Robot Doosan"
                className="absolute bottom-0 right-0 w-full object-contain"
                style={{ maxHeight: 190 }}
              />
              {/* gradient fade bottom */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: 60,
                  background: "linear-gradient(to top, #000 0%, transparent 100%)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            3 ACTION BUTTONS
        ══════════════════════════════════════════ */}
        <div className="mx-3 mt-3 bg-white rounded-xl grid grid-cols-3 divide-x divide-gray-100">
          {actionBtns.map((item, i) => (
            <Link href={item.href} key={i}>
              <button className="flex flex-col items-center justify-center gap-2 py-5 w-full active:bg-gray-50 transition-colors rounded-xl">
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-8 h-8 object-contain"
                  style={{ filter: BLUE_ICO }}
                />
                <span className="text-gray-700 text-[10px] font-medium text-center leading-tight px-1">
                  {item.label}
                </span>
              </button>
            </Link>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            MENU LIST (white card)
        ══════════════════════════════════════════ */}
        <div className="mx-3 mt-3 bg-white rounded-xl overflow-hidden shadow-sm">
          {menuItems.map((item, i) => (
            <Link href={item.href} key={i}>
              <button
                className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50 transition-colors"
                style={{ borderBottom: i < menuItems.length - 1 ? "1px solid #f0f0f0" : "none" }}
              >
                <div className="flex items-center gap-3">
                  {item.isLogo ? (
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                      <img src={item.icon} alt={item.label} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 flex items-center justify-center shrink-0">
                      <img
                        src={item.icon}
                        alt={item.label}
                        className="w-7 h-7 object-contain"
                        style={{ filter: BLUE_ICO }}
                      />
                    </div>
                  )}
                  <span className="text-gray-800 font-medium text-[14px]">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </Link>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            LOGOUT + ADMIN
        ══════════════════════════════════════════ */}
        <div className="mx-3 mt-3 mb-3">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-xl text-sm font-bold bg-white text-[#1565C0] border-2 border-[#1565C0] active:bg-blue-50"
            data-testid="button-logout"
          >
            Déconnexion
          </button>
        </div>

        {user.isAdmin && (
          <div className="mx-3 mb-4">
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl"
              style={{ background: "linear-gradient(135deg, #003366, #002244)" }}
              data-testid="button-admin"
            >
              <Shield className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-sm">Panel Admin</span>
            </button>
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════
          ADMIN PIN MODAL
      ══════════════════════════════════════════ */}
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
