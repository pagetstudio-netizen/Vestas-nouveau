import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-full" style={{ background: "#111" }}>

      {/* Header */}
      <header className="flex items-center px-4 py-3" style={{ background: "#111", borderBottom: "1px solid #222" }}>
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </Link>
        <h1 className="flex-1 text-center text-base font-semibold text-white pr-6">À propos de nous</h1>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ color: "#d4d4d4", fontSize: 13.5, lineHeight: "1.75" }}>

        <p>
          Doosan est une entreprise technologique internationale spécialisée dans la recherche et le développement de robots industriels et de solutions d'automatisation avancées. Depuis sa création, elle s'est engagée à concevoir des systèmes robotiques haute performance et un écosystème logiciel complet, offrant aux utilisateurs et aux entreprises des solutions fiables et hautement performantes. Doosan s'est rapidement imposée comme un acteur majeur du secteur de la robotique à l'échelle mondiale.
        </p>

        <p>
          La gamme de produits Doosan comprend des robots collaboratifs (cobots), des bras robotiques industriels et des systèmes autonomes. Conçus pour s'intégrer directement dans les chaînes de production, ces robots intègrent des processeurs de pointe et des systèmes de contrôle haute performance, permettant une utilisation immédiate. Doosan facilite ainsi l'accès à l'automatisation. L'entreprise privilégie également la précision, la sécurité opérationnelle et optimise en permanence la qualité de ses systèmes pour une expérience industrielle toujours plus fiable et fluide.
        </p>

        <p>
          En matière d'écosystème, Doosan développe activement une plateforme d'investissement diversifiée couvrant de multiples secteurs tels que la fabrication industrielle, la logistique, l'agriculture automatisée, la construction et l'intelligence artificielle appliquée. Grâce à sa stratégie de plateforme ouverte, Doosan a attiré de nombreux partenaires et investisseurs, enrichissant continuellement ses offres et améliorant l'expérience utilisateur. L'entreprise propose également des solutions personnalisées aux entreprises clientes pour les accompagner dans leur transformation numérique.
        </p>

        <p>
          Aujourd'hui, Doosan est présente dans plus de 80 pays avec des milliers de robots et équipements déployés à travers le monde, devenant ainsi la marque référence de l'automatisation industrielle à l'échelle internationale. La sécurité de vos fonds et la transparence de nos opérations sont nos priorités absolues.
        </p>

      </div>
    </div>
  );
}
