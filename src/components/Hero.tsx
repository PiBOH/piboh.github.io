import { motion } from "framer-motion";
import { MapPin, Link2, Users, FolderGit, Calendar } from "lucide-react";
import { useGitHub } from "../context/GitHubContext";
import { useLang } from "../context/LanguageContext";

function fmtOrUnknown(value: number | undefined, loading: boolean): string {
  if (loading || value === undefined || value === null) return "?";
  return String(value);
}

function Avatar({ url, name, avatarUrl }: { url?: string; name?: string; avatarUrl?: string }) {
  const gradientClass = "absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-lg opacity-40 transition-opacity";
  const imgClass = "relative w-24 h-24 md:w-36 md:h-36 rounded-full border-2 border-white/10 object-cover transition-colors";

  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open GitHub profile"
      className="relative block group"
    >
      <div className={`${gradientClass} group-hover:opacity-60`} />
      <img src={avatarUrl} alt={name} className={`${imgClass} group-hover:border-white/20`} />
    </a>
  ) : (
    <div className="relative">
      <div className={gradientClass} />
      <img src={avatarUrl} alt={name} className={imgClass} />
    </div>
  );
}

export default function Hero() {
  const { user, userLoading } = useGitHub();
  const { t } = useLang();
  const u = user;

  const joinYear = u?.created_at ? new Date(u.created_at).getFullYear() : "";

  return (
    <section className="relative px-4 pt-20 pb-4 md:pt-24 md:pb-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8 pb-6 border-b border-white/[0.08]">
          {/* Avatar */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="shrink-0">
            <Avatar url={u?.html_url} name={u?.name} avatarUrl={u?.avatar_url} />
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-0.5">
              {u?.html_url ? (
                <a
                  href={u.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-300 transition-colors"
                >
                  {u?.name}
                </a>
              ) : (
                u?.name
              )}
            </h1>
            <p className="text-base md:text-lg text-gray-400 mb-3">@{u?.login}</p>

            {u?.blog && (
              <div className="flex items-center gap-1.5 text-gray-500 mb-3">
                <Link2 size={13} />
                <a href={u.blog.startsWith("http") ? u.blog : `https://${u.blog}`} target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm font-mono text-cyan-400/70 hover:text-cyan-300 transition-colors">
                  {u.blog.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              </div>
            )}

            <p className="text-gray-400 text-sm md:text-[15px] mb-4 max-w-xl leading-relaxed">{u?.bio}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              {u?.location && (
                <span className="flex items-center gap-1"><MapPin size={14} />{u.location}</span>
              )}
              <a
                href={`https://github.com/${u?.login}/following`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <Users size={14} />
                <span className="text-white font-medium">{fmtOrUnknown(u?.following, userLoading)}</span> {t.hero.following}
              </a>
              <a
                href={`https://github.com/${u?.login}?tab=repositories`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <FolderGit size={14} />
                <span className="text-white font-medium">{fmtOrUnknown(u?.public_repos, userLoading)}</span> {t.hero.repos}
              </a>
              {joinYear && (
                <span className="flex items-center gap-1"><Calendar size={14} />{t.lang === "it" ? "Dal" : "Since"} {joinYear}</span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
