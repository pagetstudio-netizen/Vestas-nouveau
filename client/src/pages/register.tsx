import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { FALLBACK_COUNTRIES, type ApiCountry } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import { Loader2 } from "lucide-react";
import robotImg from "@assets/ai-robot-typing-on-ipad-isolated-on-transparent-background-fre_1784669526213.png";

const registerSchema = z.object({
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  country: z.string().min(2, "Sélectionnez un pays"),
  password: z.string().min(6, "Au moins 6 caractères"),
  confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  invitationCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);

  const params = new URLSearchParams(searchString);
  const refCode = params.get("money") || params.get("reg") || "";

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: "",
      country: "TD",
      password: "",
      confirmPassword: "",
      invitationCode: refCode,
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

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    try {
      await register({
        fullName: `User_${data.phone}`,
        phone: data.phone,
        country: data.country,
        password: data.password,
        invitationCode: data.invitationCode,
      });
      toast({ title: "Inscription réussie !", description: "Bienvenue sur Doosan !" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erreur d'inscription", description: error.message || "Une erreur est survenue", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden relative flex flex-col px-6" style={{ background: "#000000" }}>

      {/* Robot — absolute, bottom-anchored */}
      <div className="absolute bottom-0 left-0 right-0 z-0" style={{ height: "36vh" }}>
        <div className="absolute top-0 left-0 right-0 z-10"
          style={{ height: "35%", background: "linear-gradient(to bottom, #000000 0%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 z-10"
          style={{ height: "10%", background: "linear-gradient(to top, #000000 0%, transparent 100%)" }} />
        <div className="absolute inset-0 z-10" style={{ background: "rgba(0,0,0,0.18)" }} />
        <img src={robotImg} alt="Doosan Robotics" className="w-full h-full object-contain object-bottom" />
      </div>

      {/* Title — top */}
      <div className="flex-none relative z-10" style={{ paddingTop: "10vh", paddingBottom: "3vh" }}>
        <h1 className="text-white text-3xl font-bold">Inscription</h1>
      </div>

      {/* Spacer — pushes form toward bottom */}
      <div className="flex-1" />

      {/* Form — bottom zone, above robot */}
      <div className="flex-none relative z-10 flex flex-col gap-3" style={{ paddingBottom: "20vh" }}>
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
              placeholder="Mot de passe"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-base outline-none"
              data-testid="input-password"
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-red-400 text-xs -mt-1 ml-1">{form.formState.errors.password.message}</p>
          )}

          <div
            className="w-full h-14 rounded-xl flex items-center px-4"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <input
              {...form.register("confirmPassword")}
              type="password"
              placeholder="Confirmez le mot de passe"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-base outline-none"
              data-testid="input-confirm-password"
            />
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-red-400 text-xs -mt-1 ml-1">{form.formState.errors.confirmPassword.message}</p>
          )}

          <div
            className="w-full h-14 rounded-xl flex items-center px-4"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <input
              {...form.register("invitationCode")}
              placeholder="Code d'invitation"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-base outline-none"
              data-testid="input-invitation-code"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-full text-white font-bold text-base disabled:opacity-50 mt-2"
            style={{ background: "linear-gradient(135deg, #5b21b6, #4f46e5)" }}
            data-testid="button-register"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Inscription...
              </span>
            ) : "S'inscrire"}
          </button>

          <div className="text-right mt-1">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm font-semibold"
              style={{ color: "#818cf8" }}
              data-testid="link-login"
            >
              Aller à la connexion &gt;
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
