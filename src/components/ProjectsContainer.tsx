import React from "react";
import logoWorkly from "../assets/projects/logo-workly.svg";
import logoTrekks from "../assets/projects/logo-trekks.svg";
import type { Project } from "../types/Project";

interface ProjectsContainerProps {
  onProjectClick?: (project: Project) => void;
}

// Composant ProjectCard avec navigation
const ProjectCard: React.FC<{
  project: Project;
  onSizeChange: () => void;
  onProjectClick: (project: Project) => void;
}> = ({ project, onSizeChange, onProjectClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Handler pour la fin de la transition de taille
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (
      (e.propertyName === "width" || e.propertyName === "height") &&
      isHovered
    ) {
      setIsExpanded(true);
      onSizeChange();
    }
  };

  // Dès qu'on quitte le hover, on cache le contenu immédiatement
  React.useEffect(() => {
    if (!isHovered) {
      setIsExpanded(false);
      onSizeChange();
    }
  }, [isHovered, onSizeChange]);

  const handleClick = () => {
    onProjectClick(project);
  };

  return (
    <div
      className="relative rounded-lg bg-neutral-900/50 backdrop-blur-md transition-all duration-700 ease-out group cursor-pointer hover:scale-105"
      style={{
        width: isHovered ? "min(95vw, 500px)" : "clamp(140px, 25vw, 300px)",
        height: isHovered ? "min(95vw, 500px)" : "clamp(140px, 25vw, 300px)",
        backgroundImage: `
          linear-gradient(rgba(255, 122, 26, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 122, 26, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTransitionEnd={handleTransitionEnd}
      onClick={handleClick}
    >
      {/* Corners animés */}
      {/* Corner haut-gauche */}
      <div className="absolute top-0 left-0">
        {/* Trait horizontal */}
        <div
          className="bg-orange-500 group-hover:bg-orange-300"
          style={{
            width: isHovered ? 64 : 32,
            height: 2,
            transition:
              "width 0.7s cubic-bezier(0.4,0,0.2,1), background-color 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        {/* Trait vertical */}
        <div
          className="bg-orange-500 group-hover:bg-orange-300"
          style={{
            width: 2,
            height: isHovered ? 64 : 32,
            transition:
              "height 0.7s cubic-bezier(0.4,0,0.2,1), background-color 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
      {/* Corner haut-droite */}
      <div className="absolute top-0 right-0">
        {/* Trait horizontal */}
        <div
          className="bg-orange-500 group-hover:bg-orange-300 absolute top-0 right-0"
          style={{
            width: isHovered ? 64 : 32,
            height: 2,
            transition:
              "width 0.7s cubic-bezier(0.4,0,0.2,1), background-color 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        {/* Trait vertical */}
        <div
          className="bg-orange-500 group-hover:bg-orange-300 absolute top-0 right-0"
          style={{
            width: 2,
            height: isHovered ? 64 : 32,
            transition:
              "height 0.7s cubic-bezier(0.4,0,0.2,1), background-color 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
      {/* Corner bas-gauche */}
      <div className="absolute bottom-0 left-0">
        {/* Trait horizontal */}
        <div
          className="bg-orange-500 group-hover:bg-orange-300 absolute bottom-0 left-0"
          style={{
            width: isHovered ? 64 : 32,
            height: 2,
            transition:
              "width 0.7s cubic-bezier(0.4,0,0.2,1), background-color 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        {/* Trait vertical */}
        <div
          className="bg-orange-500 group-hover:bg-orange-300 absolute bottom-0 left-0"
          style={{
            width: 2,
            height: isHovered ? 64 : 32,
            transition:
              "height 0.7s cubic-bezier(0.4,0,0.2,1), background-color 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
      {/* Corner bas-droite */}
      <div className="absolute bottom-0 right-0">
        {/* Trait horizontal */}
        <div
          className="bg-orange-500 group-hover:bg-orange-300 absolute bottom-0 right-0"
          style={{
            width: isHovered ? 64 : 32,
            height: 2,
            transition:
              "width 0.7s cubic-bezier(0.4,0,0.2,1), background-color 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        {/* Trait vertical */}
        <div
          className="bg-orange-500 group-hover:bg-orange-300 absolute bottom-0 right-0"
          style={{
            width: 2,
            height: isHovered ? 64 : 32,
            transition:
              "height 0.7s cubic-bezier(0.4,0,0.2,1), background-color 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>

      {/* État initial : petit carré */}
      <div
        className={`w-full h-full flex items-center justify-center transition-all duration-700 ease-out ${
          isHovered ? "opacity-0 scale-0" : "opacity-100 scale-100"
        }`}
      >
        <img
          src={project.logo}
          alt="Logo"
          className="h-16 w-auto opacity-80 transition-all duration-700 ease-out"
        />
      </div>

      {/* État étendu : carte complète */}
      {isHovered && isExpanded && (
        <div
          className="absolute inset-0 p-8 transition-opacity duration-100 ease-out pointer-events-auto flex flex-col items-center justify-center"
          style={{ opacity: 1 }}
        >
          <div className="w-full h-auto rounded-lg mb-0 flex items-center justify-center transition-all duration-700 ease-out">
            <img
              src={project.logo}
              alt="Logo"
              className="h-40 w-auto opacity-80 hover:opacity-100 transition-all duration-700 ease-out"
            />
          </div>
          <p className="text-gray-300 text-base mb-6 font-body transition-all duration-700 ease-out text-center leading-relaxed">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-3 transition-all duration-700 ease-out">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-2 bg-orange-500/20 text-orange-400 text-sm rounded transition-all duration-700 ease-out hover:bg-orange-500/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectsContainer: React.FC<ProjectsContainerProps> = () => {
  // Handler pour la navigation vers les pages de projets
  const handleProjectClick = (project: Project) => {
    // Ouvrir les liens externes dans de nouveaux onglets
    if (project.id === "workly") {
      window.open("https://work-ly.fr", "_blank");
    } else if (project.id === "trekks") {
      window.open("https://jeremy.uiccilyon.fr", "_blank");
    }
  };

  // Données des projets
  const projects: Project[] = [
    {
      id: "workly",
      title: "Workly",
      logo: logoWorkly,
      description:
        "Workly is a next-gen recruitment agency blending artificial intelligence with a human-centered approach. I designed the full brand identity, the UX/UI of the Match360 tool, and the entire website.",
      fullDescription:
        "Workly révolutionne le recrutement en combinant intelligence artificielle et approche centrée sur l'humain. J'ai conçu l'identité de marque complète, l'UX/UI de l'outil Match360, et l'ensemble du site web avec une approche moderne et intuitive.",
      tags: [
        "HTML",
        "CSS",
        "JavaScript",
        "GSAP",
        "Figma",
        "Wordpress",
        "Adobe Suite",
      ],
      technologies: [
        "HTML5",
        "CSS3",
        "JavaScript ES6+",
        "GSAP",
        "Figma",
        "WordPress",
        "Adobe Creative Suite",
      ],
      features: [
        "Design system complet avec composants réutilisables",
        "Interface utilisateur intuitive pour l'outil Match360",
        "Animations fluides et micro-interactions",
        "Responsive design optimisé pour tous les appareils",
        "Intégration CMS WordPress personnalisée",
        "Optimisation SEO et performance",
      ],
      images: [],
    },
    {
      id: "trekks",
      title: "Trekks",
      logo: logoTrekks,
      description:
        "Trekks is a fictional trekking agency turning real adventures into gamified quests. I crafted the full brand identity and designed an immersive website experience.",
      fullDescription:
        "Trekks est une agence de trekking fictive qui transforme de vraies aventures en quêtes gamifiées. J'ai créé l'identité de marque complète et conçu une expérience web immersive qui transporte les utilisateurs dans un univers d'aventure.",
      tags: [
        "HTML",
        "CSS",
        "JavaScript",
        "GSAP",
        "Figma",
        "Wordpress",
        "Adobe Suite",
      ],
      technologies: [
        "HTML5",
        "CSS3",
        "JavaScript ES6+",
        "GSAP",
        "Figma",
        "WordPress",
        "Adobe Creative Suite",
      ],
      features: [
        "Identité visuelle complète avec storytelling immersif",
        "Expérience utilisateur gamifiée",
        "Animations 3D et transitions fluides",
        "Design responsive et accessible",
        "Système de navigation intuitif",
        "Intégration de contenu dynamique",
      ],
      images: [],
    },
  ];

  return (
    <>
      <div className="text-center mb-16">
        <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
          Projects
        </div>
        <div
          className="w-24 h-1 mx-auto"
          style={{ backgroundColor: "var(--color-grid)" }}
        ></div>
      </div>
      <div className="max-w-6xl mx-auto">
        <div
          className="flex justify-center items-center gap-8"
          style={{ width: "fit-content", margin: "0 auto" }}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSizeChange={() => {}}
              onProjectClick={handleProjectClick}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ProjectsContainer;
