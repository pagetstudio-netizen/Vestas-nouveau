import { useAuth } from "@/lib/auth";
import { SiTelegram } from "react-icons/si";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { useToast } from "@/hooks/use-toast";

import jollibeeLogo from "@assets/6790d8bd04714fedd7593cb6_Doosan_Group_and_Corporation_-_Logo.s_1784561452870.png";
import heroImg from "@assets/téléchargement_(16)_1784561452683.jpeg";
import bellIcon from "@assets/d7d9f6f6-dddc-4071-8bc2-d6e7e589fbae_(1)_1783248684110.png";
import iconRecharger from "@assets/1-1_1783245823715.png";
import iconRetraits from "@assets/2-1_1783245823825.png";
import iconService from "@assets/3-1_1783245823860.png";
import bannerBottom from "@assets/téléchargement_(16)_1784561452683.jpeg";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPopup, setShowPopup] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  // Show popup on mount and every time home tab is clicked
  useEffect(() => {
    setShowPopup(true);
    const handler = () => setShowPopup(true);
    window.addEventListener("home-tab-clicked", handler);
    return () => window.removeEventListener("home-tab-clicked", handler);
  }, []);

  useEffect(() => {
    const w = window as any;
    if (w._installPrompt) { setInstallPrompt(w._installPrompt); w._installPrompt = null; }
    if (w._appInstalled) setInstalled(true);
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (installed) {
      toast({ title: "Déjà installée", description: "L'app est déjà sur votre écran d'accueil." });
      return;
    }
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setInstallPrompt(null);
    } else {
      toast({
        title: "Installer l'application",
        description: "iPhone : Partager → Sur l'écran d'accueil. Android : menu → Ajouter à l'écran d'accueil.",
      });
    }
  };

  if (!user) return null;

  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const balance = parseFloat(user.balance || "0");
  const todayEarnings = parseFloat(user.todayEarnings || "0");
  const totalEarnings = parseFloat(user.totalEarnings || "0");

  const signupBonus = settings?.signupBonus || "500";
  const level1Commission = settings?.level1Commission || "25";
  const telegramGroupLink = settings?.groupLink || "https://t.me/doosangroup";
  const popupButtonLabel = settings?.popupButtonLabel || "Rejoindre notre groupe Telegram";

  const fmt = (n: number) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#eef2f7" }}>

      {/* ── POPUP NOTIFICATION ── */}
      {showPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.82)" }}
          onClick={() => setShowPopup(false)}
        >
          <div
            className="w-full max-w-[340px] rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "#111827" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-7 pb-2">
              <img src={bellIcon} alt="Notification" className="w-24 h-24 object-contain" />
            </div>
            <p className="text-white font-extrabold text-xl text-center tracking-widest mb-4">NOTIFICATION</p>
            <div className="px-6 pb-2 space-y-2">
              {[
                `Prime d'inscription : ${parseInt(signupBonus).toLocaleString()} FCFA.`,
                `Récompense de connexion quotidienne : 50 FCFA.`,
                `Invitez vos subordonnés à investir et recevez une récompense en espèces de ${level1Commission}% du montant de leur investissement.`,
                `Il n'y a aucune limite quant au temps de retrait ou au nombre de retraits. Vous pouvez retirer de l'argent à tout moment.`,
                `Doosan attache une grande importance au marché.`,
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-white/60 text-xs font-bold mt-0.5 shrink-0">{i + 1}.</span>
                  <p className="text-white/85 text-xs leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
            <div className="px-5 pt-5 pb-6 space-y-3">
              <button
                onClick={() => setShowPopup(false)}
                className="w-full py-3.5 bg-white rounded-full font-extrabold text-base text-gray-900"
                data-testid="button-popup-agree"
              >
                OK
              </button>
              <a
                href={telegramGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-bold text-sm text-white"
                style={{ background: "linear-gradient(90deg, #6d28d9, #7c3aed)" }}
                onClick={() => setShowPopup(false)}
              >
                <SiTelegram className="w-4 h-4" />
                Aller sur Telegram &gt;
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
        <img
          src={jollibeeLogo}
          alt="Doosan"
          className="h-9 w-auto object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />
        <button
          onClick={() => navigate("/tasks")}
          className="text-xs font-bold px-4 py-2 rounded-full text-white"
          style={{ background: "linear-gradient(135deg, #1565C0, #1E88E5)" }}
        >
          Récompenses quotidiennes
        </button>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="w-full" style={{ height: 220 }}>
        <img src={heroImg} alt="Doosan" className="w-full h-full object-cover" />
      </div>

      {/* ── 3 QUICK ACTIONS ── */}
      <div className="mx-3 mt-4 px-4 py-3">
        <div className="flex justify-around items-center">
          {/* Dépôt en ligne */}
          <button
            onClick={() => navigate("/deposit")}
            className="flex flex-col items-center gap-1"
            data-testid="button-depot"
          >
            <img src={iconRecharger} alt="Dépôt" className="w-8 h-8 object-contain"
              style={{ filter: "sepia(1) saturate(6) hue-rotate(190deg) brightness(0.7)" }} />
            <span className="text-gray-700 text-xs font-semibold text-center">Dépôt en ligne</span>
          </button>

          {/* Retrait en ligne */}
          <button
            onClick={() => navigate("/withdrawal")}
            className="flex flex-col items-center gap-1"
            data-testid="button-retrait"
          >
            <img src={iconRetraits} alt="Retrait" className="w-8 h-8 object-contain"
              style={{ filter: "sepia(1) saturate(6) hue-rotate(190deg) brightness(0.7)" }} />
            <span className="text-gray-700 text-xs font-semibold text-center">Retrait en ligne</span>
          </button>

          {/* Service client */}
          <button
            onClick={() => navigate("/service")}
            className="flex flex-col items-center gap-1"
            data-testid="button-aide"
          >
            <img src={iconService} alt="Service" className="w-8 h-8 object-contain"
              style={{ filter: "sepia(1) saturate(6) hue-rotate(190deg) brightness(0.7)" }} />
            <span className="text-gray-700 text-xs font-semibold text-center">Service client</span>
          </button>
        </div>
      </div>

      {/* ── BALANCE CARDS ── */}
      <div className="mx-3 mt-1 flex gap-3">
        {/* Solde du compte — left card */}
        <div
          className="flex-1 px-4 py-5 flex flex-col justify-center"
          style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
        >
          <p className="text-sm font-bold mb-3" style={{ color: "#1565C0" }}>
            Solde du compte
          </p>
          <p className="text-xl font-extrabold" style={{ color: "#1565C0" }}>
            {currency} {fmt(balance)}
          </p>
        </div>

        {/* Right column — two stacked mini cards */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Revenu d'aujourd'hui */}
          <div
            className="px-4 py-4"
            style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <p className="text-[11px] font-semibold text-gray-500 mb-1">
              Revenu d'aujourd'hui
            </p>
            <p className="text-base font-extrabold" style={{ color: "#1565C0" }}>
              {currency} {fmt(todayEarnings)}
            </p>
          </div>

          {/* Revenu cumulé */}
          <div
            className="px-4 py-4"
            style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <p className="text-[11px] font-semibold text-gray-500 mb-1">
              Revenu cumulé
            </p>
            <p className="text-base font-extrabold" style={{ color: "#1565C0" }}>
              {currency} {fmt(totalEarnings)}
            </p>
          </div>
        </div>
      </div>

      {/* ── BOTTOM DECORATIVE BANNER ── */}
      <div className="mx-3 mt-3 rounded-2xl overflow-hidden shadow-sm" style={{ height: 180 }}>
        <img src={bannerBottom} alt="Doosan" className="w-full h-full object-cover" />
      </div>

      <div className="pb-28" />
    </div>
  );
}
