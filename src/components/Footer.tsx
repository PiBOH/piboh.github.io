import { Heart } from "lucide-react";
import { useGitHub } from "../context/GitHubContext";
import { useLang } from "../context/LanguageContext";

export default function Footer() {
  const { user } = useGitHub();
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="py-6 md:py-10 px-4 border-t border-white/[0.06] mt-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
          <p className="text-gray-600 text-xs md:text-sm flex items-center gap-1">
            {t.footer.madeWith} <Heart size={12} className="text-rose-500" /> {t.footer.by} {user?.name} &middot; {year}
          </p>
          <p className="text-gray-700 text-[10px] md:text-xs font-mono">v2.0.9-design-opza</p>
        </div>
      </div>
    </footer>
  );
}
