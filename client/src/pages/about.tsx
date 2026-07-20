import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-full bg-white">
      <header className="flex items-center px-4 py-3 border-b bg-white">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        </Link>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">A propos de nous</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1565C0]">Qui sommes-nous ?</h2>
          <p className="text-gray-600 leading-relaxed">
            Doosan est un leader mondial de la robotique et de l'industrie lourde. L'entreprise conçoit, fabrique et déploie des robots industriels, des équipements de construction et des solutions d'automatisation avancées dans le monde entier.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Grâce à notre expertise et à notre réseau mondial, nous offrons à nos utilisateurs des opportunités uniques de générer des revenus quotidiens en participant au financement et à l'expansion de la marque Doosan à l'échelle internationale.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1565C0]">🤖 Robotique et Innovation</h2>
          <p className="text-gray-600 leading-relaxed">
            <strong>Doosan Robotics :</strong> Développement de robots collaboratifs (cobots) de haute technologie adaptés à l'industrie manufacturière, la logistique et l'agriculture. Doosan produit industriellement des bras robotiques, des systèmes autonomes et des solutions d'intelligence artificielle.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1565C0]">Notre héritage</h2>
          <p className="text-gray-600 leading-relaxed">
            Aujourd'hui, Doosan est présente dans plus de 80 pays avec des milliers de robots et équipements déployés à travers le monde, devenant ainsi la marque référence de l'automatisation industrielle à l'échelle internationale.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1565C0]">Sécurité et Fiabilité</h2>
          <p className="text-gray-600 leading-relaxed">
            La sécurité de vos fonds et la transparence de nos opérations sont nos priorités absolues. L'empreinte de Doosan dans le domaine de la robotique industrielle illustre parfaitement la capacité d'une entreprise à conjuguer qualité, innovation et stratégie de marque pérenne.
          </p>
        </div>
      </div>
    </div>
  );
}
