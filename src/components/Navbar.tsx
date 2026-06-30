import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Github, Globe } from "lucide-react";
import { useLang } from "../context/LanguageContext";

export default function Navbar() {
  const { lang, toggle } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="#" className="text-lg font-bold text-white">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">PiBOH</span>
          </a>

          <div className="flex items-center gap-3">
            <button onClick={toggle} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors">
              <Globe size={13} />{lang.toUpperCase()}
            </button>
            <a href="https://github.com/PiBOH" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
              <Github size={16} />
            </a>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-[#0a0a0f]/98 backdrop-blur-xl pt-20 px-4 md:hidden">
            <div className="flex flex-col gap-1">
              <button onClick={() => { toggle(); setMobileOpen(false); }} className="flex items-center gap-2 text-gray-300 hover:text-white py-3 border-b border-white/10 transition-colors">
                <Globe size={16} />{lang === "it" ? "Switch to English" : "Passa all'italiano"}
              </button>
              <a href="https://github.com/PiBOH" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-300 hover:text-white py-3 transition-colors">
                <Github size={18} />GitHub
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
