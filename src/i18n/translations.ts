export type Lang = "it" | "en";

export const translations = {
  it: {
    lang: "it" as const,
    nav: { home: "Home", projects: "Progetti", skills: "Competenze", issues: "Issue", orgs: "Org", about: "Chi Sono" },
    hero: { repos: "Repository", following: "Following", languages: "Linguaggi" },
    projects: { title: "Progetti", subtitle: "Repository open-source, giochi, utility e app.", search: "Cerca progetti...", all: "Tutti", none: "Nessun progetto trovato." },
    skills: { title: "Competenze", distribution: "Distribuzione Linguaggi" },
    issues: { title: "Issue Aperte", none: "Nessuna issue aperta al momento." },
    orgs: { title: "Organizzazioni", none: "Nessuna organizzazione pubblica." },
    about: { title: "Chi Sono", p1: "Ciao! Sono {name}, uno sviluppatore italiano con una passione per la creazione di software. Il mio profilo GitHub riflette la mia curiosità: dal web development al game dev, dalle utility alle app Android.", p2: "Adoro sperimentare con nuove tecnologie e trasformare idee in progetti concreti. Ogni repo è un'opportunità per imparare qualcosa di nuovo." },
    footer: { madeWith: "Fatto con", by: "da" },
    notFound: { title: "404", subtitle: "Pagina non trovata.", back: "Torna alla home" },
    sync: { syncing: "...", tooltip: "Ultimo aggiornamento" },
  },
  en: {
    lang: "en" as const,
    nav: { home: "Home", projects: "Projects", skills: "Skills", issues: "Issues", orgs: "Orgs", about: "About" },
    hero: { repos: "Repositories", following: "Following", languages: "Languages" },
    projects: { title: "Projects", subtitle: "Open-source repos, games, utilities and apps.", search: "Search projects...", all: "All", none: "No projects found." },
    skills: { title: "Skills", distribution: "Language Distribution" },
    issues: { title: "Open Issues", none: "No open issues at the moment." },
    orgs: { title: "Organizations", none: "No public organizations." },
    about: { title: "About", p1: "Hi! I'm {name}, an Italian developer with a passion for building software. My GitHub profile reflects my curiosity: from web development to game dev, from utilities to Android apps.", p2: "I love experimenting with new technologies and turning ideas into concrete projects. Every repo is an opportunity to learn something new." },
    footer: { madeWith: "Made with", by: "by" },
    notFound: { title: "404", subtitle: "Page not found.", back: "Back to home" },
    sync: { syncing: "...", tooltip: "Last updated" },
  },
} as const;

export type Translations = {
  lang: "it" | "en";
  nav: { home: string; projects: string; skills: string; issues: string; orgs: string; about: string };
  hero: { repos: string; following: string; languages: string };
  projects: { title: string; subtitle: string; search: string; all: string; none: string };
  skills: { title: string; distribution: string };
  issues: { title: string; none: string };
  orgs: { title: string; none: string };
  about: { title: string; p1: string; p2: string };
  footer: { madeWith: string; by: string };
  notFound: { title: string; subtitle: string; back: string };
  sync: { syncing: string; tooltip: string };
};
