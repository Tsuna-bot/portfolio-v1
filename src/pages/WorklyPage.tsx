import React, { useEffect, useState } from "react";
import logoWorkly from "../assets/projects/logo-workly.svg";
import { useProjectLenis } from "../hooks/useLenis";

interface WorklyPageProps {
  navigateWithTransition: (to: string) => void;
}

const WorklyPage: React.FC<WorklyPageProps> = ({ navigateWithTransition }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialiser le scroll fluide avec Lenis pour les pages de projets
  useProjectLenis();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`min-h-screen transition-all duration-1000 ease-out ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ minHeight: "100vh", minWidth: "100vw" }}
    >
      {/* Navigation minimaliste */}
      <div className="fixed top-8 left-8 z-50">
        <button
          onClick={() => navigateWithTransition("/?section=projects")}
          className="group flex items-center space-x-3 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full transition-all duration-300 hover:bg-white/10 hover:border-white/20"
        >
          <svg
            className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-white/70 group-hover:text-white font-medium transition-colors duration-300">
            Retour
          </span>
        </button>
      </div>

      {/* Hero Section épuré */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <img
              src={logoWorkly}
              alt="Workly Logo"
              className="h-32 w-auto mx-auto opacity-90"
            />
          </div>

          {/* Indicateur de scroll */}
          <div className="flex justify-center">
            <div className="w-px h-16 bg-gradient-to-b from-white/20 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-6 space-y-32">
        {/* Section Overview */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading">
                Une approche révolutionnaire
              </h2>
              <div className="w-20 h-px bg-orange-500 mb-8"></div>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-300 leading-relaxed font-body">
                Workly révolutionne le recrutement en combinant intelligence
                artificielle et approche centrée sur l'humain. J'ai conçu
                l'identité de marque complète, l'UX/UI de l'outil Match360, et
                l'ensemble du site web avec une approche moderne et intuitive.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed font-body">
                Le projet met l'accent sur l'expérience utilisateur, avec des
                interfaces fluides et des micro-interactions qui guident
                naturellement les utilisateurs à travers le processus de
                recrutement.
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-8 font-heading">
              Stack technique
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                "HTML5",
                "CSS3",
                "JavaScript ES6+",
                "GSAP",
                "Figma",
                "WordPress",
                "Adobe Creative Suite",
              ].map((tech) => (
                <div
                  key={tech}
                  className="px-4 py-3 bg-white/5 text-white/80 text-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Fonctionnalités */}
        <section>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading">
              Fonctionnalités
            </h2>
            <div className="w-20 h-px bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎨",
                title: "Design system complet",
                desc: "Composants cohérents et réutilisables",
              },
              {
                icon: "🤖",
                title: "Interface Match360",
                desc: "Outil d'IA pour le recrutement",
              },
              {
                icon: "✨",
                title: "Micro-interactions",
                desc: "Animations fluides et engageantes",
              },
              {
                icon: "📱",
                title: "Design responsive",
                desc: "Optimisé pour tous les appareils",
              },
              {
                icon: "⚙️",
                title: "CMS WordPress",
                desc: "Intégration personnalisée",
              },
              {
                icon: "🚀",
                title: "Performance optimisée",
                desc: "SEO et vitesse de chargement",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105"
              >
                <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-all duration-300">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 font-heading">
                  {feature.title}
                </h3>
                <p className="text-gray-400 font-body leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section Processus */}
        <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading">
              Processus de création
            </h2>
            <div className="w-20 h-px bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Recherche",
                desc: "Analyse du marché et des besoins",
              },
              {
                step: "02",
                title: "Design",
                desc: "Création de l'identité visuelle",
              },
              {
                step: "03",
                title: "Développement",
                desc: "Intégration et développement",
              },
              {
                step: "04",
                title: "Optimisation",
                desc: "Tests et améliorations",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-orange-500/20">
                  <span className="text-orange-400 font-bold text-xl">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-heading">
                  {item.title}
                </h3>
                <p className="text-gray-400 font-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section CTA */}
        <section className="text-center py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-heading">
            Envie de voir plus ?
          </h2>
          <p className="text-gray-400 mb-8 font-body max-w-2xl mx-auto">
            Découvrez d'autres projets ou discutons de votre prochain challenge
            créatif.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigateWithTransition("/?section=projects")}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105"
            >
              Voir tous les projets
            </button>
            <button
              onClick={() => navigateWithTransition("/?section=contact")}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-full border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              Me contacter
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WorklyPage;
