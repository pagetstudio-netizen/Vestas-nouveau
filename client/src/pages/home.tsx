import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { useToast } from "@/hooks/use-toast";

import jollibeeLogo  from "@assets/6790d8bd04714fedd7593cb6_Doosan_Group_and_Corporation_-_Logo.s_1784561452870.png";
import heroImg       from "@assets/téléchargement_(16)_1784561452683.jpeg";
import iconBell      from "@assets/d68b81d4-3a8a-4ba0-804f-d77f381cb5ab_1784756497520.png";
import iconSignin    from "@assets/icon-signin.png";
import bgDoosan      from "@assets/téléchargement_(18)_1784756497633.jpeg";
import bgConference  from "@assets/téléchargement_(15)_1784756497654.jpeg";
import bgCumul       from "@assets/téléchargement_(17)_1784756905309.jpeg";
import iconRecharger from "@assets/1-1_1783245823715.png";
import iconRetraits  from "@assets/2-1_1783245823825.png";
import iconService   from "@assets/3-1_1783245823860.png";

/* CSS filter : tinte la cloche en or/ambré */
const BELL_COLOR = "brightness(0) saturate(100%) invert(78%) sepia(80%) saturate(600%) hue-rotate(5deg) brightness(105%)";
const BLUE_MASK  = "#1565C0";

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

  const country       = getCountryByCode(user.country);
  const currency      = country?.currency || "FCFA";
  const balance       = parseFloat(user.balance || "0");
  const todayEarnings = parseFloat(user.todayEarnings || "0");
  const totalEarnings = parseFloat(user.totalEarnings || "0");

  const signupBonus       = settings?.signupBonus || "500";
  const level1Commission  = settings?.level1Commission || "25";
  const telegramGroupLink = settings?.groupLink || "https://t.me/doosangroup";
  const noticeText        = settings?.noticeText ||
    "Bienvenue sur Doosan Robotics ! Investissez dans nos robots industriels et générez des revenus quotidiens.";

  const fmt = (n: number) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const maskStyle = (src: string) => ({
    width: 34, height: 34,
    background: BLUE_MASK,
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  });

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#eef2f7" }}>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .marquee-track { animation: marquee 22s linear infinite; white-space: nowrap; }
      `}</style>

      {/* ── POPUP NOTIFICATION ── */}
      {showPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setShowPopup(false)}
        >
          <div
            className="w-full max-w-[320px] bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Body */}
            <div className="px-6 pt-7 pb-5 text-center">
              <p className="text-gray-800 font-semibold text-base leading-snug">
                {noticeText}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Buttons */}
            <div className="flex">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 py-4 text-gray-500 font-semibold text-sm border-r border-gray-100"
                data-testid="button-popup-agree"
              >
                Fermer
              </button>
              <a
                href={telegramGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 text-white font-bold text-sm flex items-center justify-center gap-1.5"
                style={{ background: "#16a34a" }}
                onClick={() => setShowPopup(false)}
              >
                Rejoindre
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-white shadow-sm">
        <img
          src={jollibeeLogo}
          alt="Doosan"
          className="h-6 w-auto object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />
        <button
          onClick={() => navigate("/checkin")}
          className="text-[10px] font-bold px-3 py-1 rounded-full text-white"
          style={{ background: "linear-gradient(135deg, #1565C0, #1E88E5)" }}
        >
          Récompenses quotidiennes
        </button>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="w-full" style={{ height: 220 }}>
        <img src={heroImg} alt="Doosan" className="w-full h-full object-cover" />
      </div>

      {/* ── 4 QUICK ACTIONS ── */}
      <div className="mx-3 mt-3 bg-white rounded-2xl shadow-sm px-2 py-3">
        <div className="grid grid-cols-4 divide-x divide-gray-100">
          {[
            { icon: iconRecharger, label: "Dépôt en ligne",   href: "/deposit",    mask: true },
            { icon: iconRetraits,  label: "Retrait en ligne", href: "/withdrawal", mask: true },
            { icon: iconService,   label: "Service client",   href: "/service",    mask: true },
            { icon: iconSignin,    label: "S'identifier",     href: "/checkin",    mask: true  },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.href)}
              className="flex flex-col items-center gap-1.5 py-1 active:opacity-70 transition-opacity"
            >
              {item.mask ? (
                <div style={maskStyle(item.icon)} />
              ) : (
                <img src={item.icon} alt={item.label} className="w-8 h-8 object-contain" />
              )}
              <span className="text-gray-700 text-[10px] font-semibold text-center leading-tight px-1">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── SCROLLING NOTIFICATION TICKER ── */}
      <div
        className="mx-3 mt-3 rounded-xl overflow-hidden flex items-center gap-3 px-3 py-2.5 bg-white shadow-sm"
        style={{ border: "1px solid #e5eaf2" }}
      >
        <img
          src={iconBell}
          alt="notif"
          className="w-5 h-5 object-contain shrink-0"
          style={{ filter: BELL_COLOR }}
        />
        <div className="flex-1 overflow-hidden">
          <p className="marquee-track text-gray-600 text-xs font-medium">
            {noticeText}
          </p>
        </div>
      </div>

      {/* ── BALANCE CARDS — photo backgrounds, taller ── */}
      <div className="mx-3 mt-3 flex gap-3">

        {/* Solde du compte — left, tall, Doosan Robotics bg */}
        <div
          className="flex-1 rounded-2xl overflow-hidden relative shadow-sm"
          style={{ height: 210 }}
        >
          <img src={bgDoosan} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(160deg, rgba(0,20,80,0.72) 0%, rgba(0,10,50,0.45) 100%)" }}
          />
          <div className="relative z-10 p-4 flex flex-col justify-between h-full">
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider">
              Solde du compte
            </p>
            <div>
              <p className="text-white font-extrabold text-2xl leading-tight" data-testid="text-balance">
                {fmt(balance)}
              </p>
              <p className="text-white/70 text-xs mt-0.5">{currency}</p>
            </div>
          </div>
        </div>

        {/* Right column — 2 stacked cards */}
        <div className="flex-1 flex flex-col gap-3">

          {/* Revenu d'aujourd'hui — conference bg */}
          <div
            className="rounded-2xl overflow-hidden relative shadow-sm"
            style={{ height: 100 }}
          >
            <img src={bgConference} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
            <div
              className="absolute inset-0"
              style={{ background: "rgba(0,0,0,0.58)" }}
            />
            <div className="relative z-10 p-3 flex flex-col justify-between h-full">
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider leading-tight">
                Revenu d'aujourd'hui
              </p>
              <div>
                <p className="text-white font-extrabold text-base leading-none" data-testid="text-today-earnings">
                  {fmt(todayEarnings)}
                </p>
                <p className="text-white/70 text-[10px] mt-0.5">{currency}</p>
              </div>
            </div>
          </div>

          {/* Revenu cumulé — turbine bg */}
          <div
            className="rounded-2xl overflow-hidden relative shadow-sm"
            style={{ height: 100 }}
          >
            <img src={bgCumul} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
            <div
              className="absolute inset-0"
              style={{ background: "rgba(0,0,0,0.55)" }}
            />
            <div className="relative z-10 p-3 flex flex-col justify-between h-full">
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">
                Revenu cumulé
              </p>
              <div>
                <p className="text-white font-extrabold text-base leading-none" data-testid="text-total-earnings">
                  {fmt(totalEarnings)}
                </p>
                <p className="text-white/70 text-[10px] mt-0.5">{currency}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="pb-28" />
    </div>
  );
}
