import { createContext, useContext, useState, type ReactNode } from "react";
import { translations, type Lang, type Translations } from "../i18n/translations";

interface LangState {
  lang: Lang;
  t: Translations;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

const LanguageContext = createContext<LangState | null>(null);

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("piboh-lang") as Lang | null;
    return saved === "en" ? "en" : "it";
  });

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("piboh-lang", l);
  };

  const toggle = () => handleSetLang(lang === "it" ? "en" : "it");

  return (
    <LanguageContext.Provider
      value={{ lang, t: translations[lang], setLang: handleSetLang, toggle }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
