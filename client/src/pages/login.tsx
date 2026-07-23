import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { FALLBACK_COUNTRIES, type ApiCountry } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import { Loader2 } from "lucide-react";
import intelLogo from "@assets/6790d8bd04714fedd7593cb6_Doosan_Group_and_Corporation_-_Logo.s_1784561452870.png";
import robotImg from "@assets/ai-robot-typing-on-ipad-isolated-on-transparent-background-fre_1784669526213.png";

const loginSchema = z.object({
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  country: z.string().min(2, "Sélectionnez un pays"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      country: "TG",
      password: "",
    },
  });

  const { data: apiCountries } = useQuery<ApiCountry[]>({
    queryKey: ["/api/countries"],
  });

  const selectedCountry = form.watch("country");

  useEffect(() => {
    // Remove credentials persisted by versions that stored login data locally.
    localStorage.removeItem("doosan_credentials");
    localStorage.removeItem("doosan_login_preferences");
  }, []);

  useEffect(() => {
    if (!apiCountries || apiCountries.length === 0) return;
    const isValid = apiCountries.some(ac => ac.code === selectedCountry && ac.isActive);
    // Keep a remembered/selected country long enough for the server to apply
    // the administrator-only cross-country login rule.
    if (!isValid) {
      const first = apiCountries.find(ac => ac.isActive);
      if (first) form.setValue("country", first.code);
    }
  }, [apiCountries, selectedCountry, form]);

  const countryData = (() => {
    if (apiCountries && apiCountries.length > 0) {
      const c = apiCountries.find(ac => ac.code === selectedCountry && ac.isActive);
      if (c) return { phonePrefix: c.phonePrefix, name: c.name };
      return null;
    }
    const f = FALLBACK_COUNTRIES.find(fc => fc.code === selectedCountry);
    return f ? { phonePrefix: f.phonePrefix, name: f.name } : null;
  })();

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      await login(data.phone, data.country, data.password);
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erreur de connexion", description: error.message || "Vérifiez vos informations", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden relative flex flex-col px-6" style={{ background: "#000000" }}>

      {/* Robot — absolute, bottom-anchored, overlaps button area */}
      <div className="absolute bottom-0 left-0 right-0 z-0" style={{ height: "46vh" }}>
        <div className="absolute top-0 left-0 right-0 z-10"
          style={{ height: "32%", background: "linear-gradient(to bottom, #000000 0%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 z-10"
          style={{ height: "10%", background: "linear-gradient(to top, #000000 0%, transparent 100%)" }} />
        <div className="absolute inset-0 z-10" style={{ background: "rgba(0,0,0,0.18)" }} />
        <img src={robotImg} alt="Doosan Robotics" className="w-full h-full object-contain object-bottom" />
      </div>

      {/* Logo — upper zone, flex-1 centres it vertically in the available space */}
      <div className="flex-1 flex items-center justify-center relative z-10" style={{ paddingTop: "5vh" }}>
        <img
          src={intelLogo}
          alt="Doosan"
          className="h-16 w-auto object-contain"
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </div>

      {/* Form — bottom zone, padding pushes it above the robot */}
      <div className="flex-none relative z-10 flex flex-col gap-3" style={{ paddingBottom: "29vh" }}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <input type="hidden" {...form.register("country")} />

          <button
            type="button"
            onClick={() => setCountryModalOpen(true)}
            className="w-full h-14 rounded-xl flex items-center px-4 text-left"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}
            data-testid="button-select-country"
          >
            <span className="text-white/60 text-base">
              {countryData ? `+${countryData.phonePrefix}` : "+--"}
            </span>
            <span className="mx-2 text-white/30">›</span>
            <input
              {...form.register("phone")}
              type="tel"
              autoComplete="username"
              placeholder="Entrez votre identifiant"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-base outline-none"
              data-testid="input-phone"
              onClick={e => e.stopPropagation()}
            />
          </button>
          {form.formState.errors.phone && (
            <p className="text-red-400 text-xs -mt-1 ml-1">{form.formState.errors.phone.message}</p>
          )}

          <div
            className="w-full h-14 rounded-xl flex items-center px-4"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <input
              {...form.register("password")}
              type="password"
              autoComplete="current-password"
              placeholder="Mot de passe"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-base outline-none"
              data-testid="input-password"
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-red-400 text-xs -mt-1 ml-1">{form.formState.errors.password.message}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-full text-white font-bold text-base disabled:opacity-50 mt-2"
            style={{ background: "linear-gradient(135deg, #5b21b6, #4f46e5)" }}
            data-testid="button-login"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Connexion...
              </span>
            ) : "Se connecter"}
          </button>

          <div className="text-right mt-1">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-sm font-semibold"
              style={{ color: "#818cf8" }}
              data-testid="link-register"
            >
              Aller à l'inscription &gt;
            </button>
          </div>
        </form>
      </div>

      <CountrySelector
        open={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        onSelect={(code) => form.setValue("country", code, { shouldValidate: true })}
      />
    </div>
  );
}
