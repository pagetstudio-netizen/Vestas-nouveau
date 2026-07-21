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

  const savedCredentials = typeof window !== "undefined" ? localStorage.getItem("doosan_credentials") : null;
  const parsedCredentials = savedCredentials ? JSON.parse(savedCredentials) : null;
  const [rememberMe, setRememberMe] = useState(!!parsedCredentials);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: parsedCredentials?.phone || "",
      country: parsedCredentials?.country || "TD",
      password: parsedCredentials?.password || "",
    },
  });

  const { data: apiCountries } = useQuery<ApiCountry[]>({
    queryKey: ["/api/countries"],
  });

  const selectedCountry = form.watch("country");

  useEffect(() => {
    if (!apiCountries || apiCountries.length === 0) return;
    const isValid = apiCountries.some(ac => ac.code === selectedCountry && ac.isActive);
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
      if (rememberMe) {
        localStorage.setItem("doosan_credentials", JSON.stringify({ phone: data.phone, country: data.country, password: data.password }));
      } else {
        localStorage.removeItem("doosan_credentials");
      }
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erreur de connexion", description: error.message || "Vérifiez vos informations", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: "#000000" }}>

      {/* Robot image — behind content, bottom-anchored, overlaps form */}
      <div className="absolute bottom-0 left-0 right-0 z-0" style={{ height: "65vh" }}>
        {/* top fade — gentle, lets robot head peek into form area */}
        <div
          className="absolute top-0 left-0 right-0 z-10"
          style={{ height: "28%", background: "linear-gradient(to bottom, #000000 0%, transparent 100%)" }}
        />
        {/* bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10"
          style={{ height: "15%", background: "linear-gradient(to top, #000000 0%, transparent 100%)" }}
        />
        {/* dark tint */}
        <div className="absolute inset-0 z-10" style={{ background: "rgba(0,0,0,0.20)" }} />
        <img
          src={robotImg}
          alt="Doosan Robotics"
          className="w-full h-full object-contain object-bottom"
        />
      </div>

      {/* Scrollable content — sits above image */}
      <div className="relative z-10 flex flex-col px-6 pt-12" style={{ paddingBottom: "38vh" }}>

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img
            src={intelLogo}
            alt="Doosan"
            className="h-16 w-auto object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <input type="hidden" {...form.register("country")} />

          {/* Sélectionner pays + téléphone */}
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
              placeholder="Entrez votre identifiant"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-base outline-none"
              data-testid="input-phone"
              onClick={e => e.stopPropagation()}
            />
          </button>
          {form.formState.errors.phone && (
            <p className="text-red-400 text-xs -mt-1 ml-1">{form.formState.errors.phone.message}</p>
          )}

          {/* Mot de passe */}
          <div
            className="w-full h-14 rounded-xl flex items-center px-4"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <input
              {...form.register("password")}
              type="password"
              placeholder="Mot de passe"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-base outline-none"
              data-testid="input-password"
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-red-400 text-xs -mt-1 ml-1">{form.formState.errors.password.message}</p>
          )}

          {/* Se souvenir */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4"
              data-testid="checkbox-remember"
            />
            <label htmlFor="remember" className="text-white/60 text-sm cursor-pointer">
              Se souvenir de mon mot de passe
            </label>
          </div>

          {/* Bouton connexion */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-full text-white font-bold text-base disabled:opacity-50 mt-3"
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

          {/* Lien inscription */}
          <div className="text-right mt-2">
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
