import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";

export default function NotFound() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-block mb-6"
        >
          <AlertTriangle size={64} className="text-yellow-500/60" />
        </motion.div>

        <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          {t.notFound.title}
        </h1>
        <p className="text-xl text-gray-400 mb-10">{t.notFound.subtitle}</p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all hover:scale-105"
        >
          <Home size={18} />
          <span>{t.notFound.back}</span>
        </Link>
      </motion.div>
    </div>
  );
}
