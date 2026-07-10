import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X, Star, GitFork, Link2 } from "lucide-react";
import { languageColors } from "../context/GitHubContext";
import type { Project } from "../context/GitHubContext";
import { cleanUrl, ago, fmt } from "../utils/formatting";
import RepoIcon from "./RepoIcon";

interface RepoGridProps {
  projects: Project[];
  loading: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
}

export default function RepoGrid({ projects, loading, searchPlaceholder, emptyText }: RepoGridProps) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("updated");
  const [query, setQuery] = useState("");
  const [selLang, setSelLang] = useState<string | null>(null);

  const allLanguages = Array.from(new Set(projects.map((p) => p.language).filter(Boolean))).sort() as string[];
  const getLangColor = (lang: string | null) => languageColors[lang || "null"] || "#8b949e";

  let filtered = [...projects];
  if (filter === "source") filtered = filtered.filter((r) => !r.fork);
  else if (filter === "fork") filtered = filtered.filter((r) => r.fork);
  if (selLang) filtered = filtered.filter((r) => r.language === selLang);
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter((r) => r.name.toLowerCase().includes(q) || (r.description?.toLowerCase() || "").includes(q));
  }
  if (sort === "stars") filtered.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
  else if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  else filtered.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());

  return (
    <>
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            placeholder={searchPlaceholder || "Search..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/50"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "source", "fork"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                filter === f
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/25"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              {f === "all" ? "All" : f === "source" ? "Source" : "Fork"}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-xs focus:outline-none"
        >
          <option value="updated">Last updated</option>
          <option value="stars">Stars</option>
          <option value="name">Name</option>
        </select>
      </div>

      {allLanguages.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <button
            onClick={() => setSelLang(null)}
            className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
              selLang === null
                ? "bg-purple-500/15 text-purple-300 border border-purple-500/25"
                : "bg-white/5 text-gray-500 border border-white/10"
            }`}
          >
            All
          </button>
          {allLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelLang(lang === selLang ? null : lang)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all ${
                selLang === lang
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/25"
                  : "bg-white/5 text-gray-500 border border-white/10"
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLangColor(lang) }} />
              {lang}
            </button>
          ))}
        </div>
      )}

      {loading && projects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
              className="group bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <RepoIcon repoName={project.name} language={project.language} defaultBranch={project.default_branch} />
                  <a
                    href={project.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-purple-300 hover:text-purple-200 truncate transition-colors"
                  >
                    {project.name}
                  </a>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 border border-white/10 rounded-full text-gray-600 shrink-0">
                  {project.private ? "Private" : "Public"}
                </span>
              </div>

              {project.homepage && (
                <a
                  href={project.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-400/70 hover:text-cyan-300 mb-2 transition-colors"
                >
                  <Link2 size={10} />
                  <span className="truncate max-w-[200px]">{cleanUrl(project.homepage)}</span>
                </a>
              )}

              <p className="text-gray-500 text-xs mb-3 line-clamp-2">{project.description || "No description."}</p>

              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-600">
                {project.language && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLangColor(project.language) }} />
                    {project.language}
                  </span>
                )}
                {project.stargazers_count ? (
                  <span className="flex items-center gap-0.5">
                    <Star size={11} />
                    {fmt(project.stargazers_count)}
                  </span>
                ) : null}
                {project.forks_count ? (
                  <span className="flex items-center gap-0.5">
                    <GitFork size={11} />
                    {fmt(project.forks_count)}
                  </span>
                ) : null}
                <span>{ago(project.updated_at)}</span>
              </div>

              {project.topics.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {project.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="px-1.5 py-0.5 bg-purple-500/8 text-purple-400/70 text-[10px] rounded border border-purple-500/15"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-sm">{emptyText || "No projects found."}</p>
        </div>
      )}
    </>
  );
}
