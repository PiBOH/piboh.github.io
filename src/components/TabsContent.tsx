import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Star, GitFork, Link2, ExternalLink, Code2, Smartphone, Gamepad2, Globe, Terminal, Palette } from "lucide-react";
import { useGitHub } from "../context/GitHubContext";
import { languageColors } from "../context/GitHubContext";
import { useLang } from "../context/LanguageContext";
import RepoIcon from "./RepoIcon";

function cleanUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function ago(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 604800)}w`;
}

function fmt(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(n);
}

const skillCategories = [
  { icon: Code2, title: "Web", desc: "TypeScript, JavaScript, HTML, CSS", color: "text-cyan-400", bg: "from-blue-500/20 to-cyan-500/20" },
  { icon: Smartphone, title: "Mobile", desc: "Kotlin per Android", color: "text-purple-400", bg: "from-purple-500/20 to-pink-500/20" },
  { icon: Gamepad2, title: "Games", desc: "Browser games, Minecraft mods", color: "text-emerald-400", bg: "from-green-500/20 to-emerald-500/20" },
  { icon: Globe, title: "Utilities", desc: "PDF, Markdown, Flowchart", color: "text-amber-400", bg: "from-orange-500/20 to-amber-500/20" },
  { icon: Terminal, title: "Scripting", desc: "Python, PowerShell", color: "text-rose-400", bg: "from-red-500/20 to-rose-500/20" },
  { icon: Palette, title: "Design", desc: "Image editor, Background remover", color: "text-indigo-400", bg: "from-violet-500/20 to-indigo-500/20" },
];

export default function TabsContent() {
  const { repos, starred, issues, orgs, user, reposLoading, starredLoading, issuesLoading, orgsLoading, refreshStarred, refreshOrgs } = useGitHub();
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<"about" | "repos" | "starred" | "issues" | "orgs">("about");

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === "starred") refreshStarred();
    if (tab === "orgs") refreshOrgs();
  };

  // Repo filters
  const [repoFilter, setRepoFilter] = useState("all");
  const [repoSort, setRepoSort] = useState("updated");
  const [repoQ, setRepoQ] = useState("");
  const [selLang, setSelLang] = useState<string | null>(null);

  // Issue filters
  const [issueFilter, setIssueFilter] = useState("all");
  const [issueSort, setIssueSort] = useState("created");
  const [issueQ, setIssueQ] = useState("");

  // Starred filters
  const [starredQ, setStarredQ] = useState("");
  const [starredSort, setStarredSort] = useState("updated");

  const allLanguages = Array.from(new Set(repos.map((p) => p.language).filter(Boolean))).sort() as string[];
  const getLangColor = (lang: string | null) => languageColors[lang || "null"] || "#8b949e";

  // Filter repos
  let filteredRepos = [...repos];
  if (repoFilter === "source") filteredRepos = filteredRepos.filter((r) => !r.fork);
  else if (repoFilter === "fork") filteredRepos = filteredRepos.filter((r) => r.fork);
  if (selLang) filteredRepos = filteredRepos.filter((r) => r.language === selLang);
  if (repoQ) {
    const q = repoQ.toLowerCase();
    filteredRepos = filteredRepos.filter((r) => r.name.toLowerCase().includes(q) || (r.description?.toLowerCase() || "").includes(q));
  }
  if (repoSort === "stars") filteredRepos.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
  else if (repoSort === "name") filteredRepos.sort((a, b) => a.name.localeCompare(b.name));
  else filteredRepos.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());

  // Filter issues
  let filteredIssues = [...issues];
  if (issueFilter === "open") filteredIssues = filteredIssues.filter((i) => i.state === "open");
  else if (issueFilter === "closed") filteredIssues = filteredIssues.filter((i) => i.state === "closed");
  if (issueQ) {
    const q = issueQ.toLowerCase();
    filteredIssues = filteredIssues.filter((i) => i.title.toLowerCase().includes(q) || (i.user_login?.toLowerCase() || "").includes(q));
  }
  if (issueSort === "updated") filteredIssues.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Filter starred
  let filteredStarred = [...starred];
  if (starredQ) {
    const q = starredQ.toLowerCase();
    filteredStarred = filteredStarred.filter((r) => r.name.toLowerCase().includes(q) || (r.description?.toLowerCase() || "").includes(q) || (r.owner?.login.toLowerCase() || "").includes(q));
  }
  if (starredSort === "stars") filteredStarred.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
  else if (starredSort === "name") filteredStarred.sort((a, b) => a.name.localeCompare(b.name));
  else filteredStarred.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());

  // Language stats
  const langStats = repos.reduce((acc, p) => { acc[p.language || "Other"] = (acc[p.language || "Other"] || 0) + 1; return acc; }, {} as Record<string, number>);
  const sortedLangs = Object.entries(langStats).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const totalLangs = sortedLangs.reduce((s, [, c]) => s + c, 0) || 1;

  const tabs = [
    { key: "about" as const, label: t.nav.about, count: null },
    { key: "repos" as const, label: t.nav.projects, count: repos.length },
    { key: "starred" as const, label: "Starred", count: starred.length },
    { key: "issues" as const, label: t.nav.issues, count: issues.length },
    { key: "orgs" as const, label: t.nav.orgs, count: orgs.length },
  ];

  return (
    <section className="px-4 py-2 md:py-4">
      <div className="max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-white/[0.08] mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors relative ${
                activeTab === tab.key ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`px-1.5 py-0.5 text-[11px] rounded-full border ${
                  activeTab === tab.key ? "bg-white/10 text-gray-300 border-white/10" : "bg-white/5 text-gray-600 border-white/5"
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.key && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">{t.lang === "it" ? "Biografia" : "Bio"}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{t.about.p1.replace("{name}", user?.name || "PiBOH")}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{t.about.p2}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {skillCategories.map((s) => (
                    <div key={s.title} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.06] transition-all">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.bg} flex items-center justify-center mb-2`}>
                        <s.icon size={18} className={s.color} />
                      </div>
                      <h4 className="text-white font-medium text-sm">{s.title}</h4>
                      <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-5">{t.skills.distribution}</h3>
                {reposLoading && repos.length === 0 ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-6 bg-white/5 rounded-lg animate-pulse" />)}
                  </div>
                ) : sortedLangs.length > 0 ? (
                  <div className="space-y-3">
                    {sortedLangs.map(([lang, count]) => {
                      const pct = Math.round((count / totalLangs) * 100);
                      const color = languageColors[lang] || "#8b949e";
                      return (
                        <div key={lang}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} /><span className="text-sm text-gray-300">{lang}</span></div>
                            <span className="text-xs text-gray-500">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.1 }} className="h-full rounded-full" style={{ backgroundColor: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">{t.lang === "it" ? "Nessun dato disponibile." : "No data available."}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* REPOS TAB */}
          {activeTab === "repos" && (
            <motion.div key="repos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="flex flex-col md:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input type="text" placeholder={t.projects.search} value={repoQ} onChange={(e) => setRepoQ(e.target.value)} className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/50" />
                  {repoQ && <button onClick={() => setRepoQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"><X size={14} /></button>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {["all", "source", "fork"].map((f) => (
                    <button key={f} onClick={() => setRepoFilter(f)} className={`px-3 py-1.5 rounded-md text-xs transition-all ${repoFilter === f ? "bg-purple-500/15 text-purple-300 border border-purple-500/25" : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"}`}>
                      {f === "all" ? t.projects.all : f === "source" ? "Source" : "Fork"}
                    </button>
                  ))}
                </div>
                <select value={repoSort} onChange={(e) => setRepoSort(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-xs focus:outline-none">
                  <option value="updated">{t.lang === "it" ? "Ultimo aggiornamento" : "Last updated"}</option>
                  <option value="stars">Stars</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {allLanguages.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-5">
                  <button onClick={() => setSelLang(null)} className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${selLang === null ? "bg-purple-500/15 text-purple-300 border border-purple-500/25" : "bg-white/5 text-gray-500 border border-white/10"}`}>All</button>
                  {allLanguages.map((lang) => (
                    <button key={lang} onClick={() => setSelLang(lang === selLang ? null : lang)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all ${selLang === lang ? "bg-purple-500/15 text-purple-300 border border-purple-500/25" : "bg-white/5 text-gray-500 border border-white/10"}`}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLangColor(lang) }} />{lang}
                    </button>
                  ))}
                </div>
              )}

              {reposLoading && repos.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-36 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRepos.map((project, index) => (
                    <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }} className="group bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <RepoIcon repoName={project.name} language={project.language} defaultBranch={project.default_branch} />
                          <a href={project.html_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-purple-300 hover:text-purple-200 truncate transition-colors">{project.name}</a>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 border border-white/10 rounded-full text-gray-600 shrink-0">{project.private ? "Private" : "Public"}</span>
                      </div>

                      {project.homepage && (
                        <a href={project.homepage} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-cyan-400/70 hover:text-cyan-300 mb-2 transition-colors">
                          <Link2 size={10} /><span className="truncate max-w-[200px]">{cleanUrl(project.homepage)}</span>
                        </a>
                      )}

                      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{project.description || "No description."}</p>

                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-600">
                        {project.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLangColor(project.language) }} />{project.language}</span>}
                        {project.stargazers_count ? <span className="flex items-center gap-0.5"><Star size={11} />{fmt(project.stargazers_count)}</span> : null}
                        {project.forks_count ? <span className="flex items-center gap-0.5"><GitFork size={11} />{fmt(project.forks_count)}</span> : null}
                        <span>{ago(project.updated_at)}</span>
                      </div>

                      {project.topics.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {project.topics.slice(0, 3).map((topic) => (
                            <span key={topic} className="px-1.5 py-0.5 bg-purple-500/8 text-purple-400/70 text-[10px] rounded border border-purple-500/15">{topic}</span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {filteredRepos.length === 0 && !reposLoading && <div className="text-center py-12"><p className="text-gray-600 text-sm">{t.projects.none}</p></div>}
            </motion.div>
          )}

          {/* STARRED TAB */}
          {activeTab === "starred" && (
            <motion.div key="starred" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="flex flex-col md:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input type="text" placeholder={t.lang === "it" ? "Cerca starred..." : "Search starred..."} value={starredQ} onChange={(e) => setStarredQ(e.target.value)} className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-yellow-500/50" />
                  {starredQ && <button onClick={() => setStarredQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"><X size={14} /></button>}
                </div>
                <select value={starredSort} onChange={(e) => setStarredSort(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-xs focus:outline-none">
                  <option value="updated">{t.lang === "it" ? "Ultimo aggiornamento" : "Last updated"}</option>
                  <option value="stars">Stars</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {starredLoading && starred.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-36 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStarred.map((project, index) => (
                    <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }} className="group bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <RepoIcon repoName={project.name} language={project.language} defaultBranch={project.default_branch} />
                          <div className="min-w-0">
                            <a href={project.html_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-yellow-300 hover:text-yellow-200 truncate transition-colors block">{project.name}</a>
                            {project.owner && <span className="text-[10px] text-gray-500">{project.owner.login}</span>}
                          </div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 border border-white/10 rounded-full text-gray-600 shrink-0">{project.private ? "Private" : "Public"}</span>
                      </div>

                      {project.homepage && (
                        <a href={project.homepage} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-cyan-400/70 hover:text-cyan-300 mb-2 transition-colors">
                          <Link2 size={10} /><span className="truncate max-w-[200px]">{cleanUrl(project.homepage)}</span>
                        </a>
                      )}

                      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{project.description || "No description."}</p>

                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-600">
                        {project.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLangColor(project.language) }} />{project.language}</span>}
                        {project.stargazers_count ? <span className="flex items-center gap-0.5"><Star size={11} />{fmt(project.stargazers_count)}</span> : null}
                        {project.forks_count ? <span className="flex items-center gap-0.5"><GitFork size={11} />{fmt(project.forks_count)}</span> : null}
                        <span>{ago(project.updated_at)}</span>
                      </div>

                      {project.topics && project.topics.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {project.topics.slice(0, 3).map((topic) => (
                            <span key={topic} className="px-1.5 py-0.5 bg-yellow-500/8 text-yellow-400/70 text-[10px] rounded border border-yellow-500/15">{topic}</span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {filteredStarred.length === 0 && !starredLoading && <div className="text-center py-12"><p className="text-gray-600 text-sm">{t.lang === "it" ? "Nessun repository stellato." : "No starred repositories."}</p></div>}
            </motion.div>
          )}

          {/* ISSUES TAB */}
          {activeTab === "issues" && (
            <motion.div key="issues" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="flex flex-col md:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input type="text" placeholder={t.lang === "it" ? "Cerca issue..." : "Search issues..."} value={issueQ} onChange={(e) => setIssueQ(e.target.value)} className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500/50" />
                  {issueQ && <button onClick={() => setIssueQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"><X size={14} /></button>}
                </div>
                <div className="flex items-center gap-2">
                  {["all", "open", "closed"].map((f) => (
                    <button key={f} onClick={() => setIssueFilter(f)} className={`px-3 py-1.5 rounded-md text-xs transition-all ${issueFilter === f ? "bg-orange-500/15 text-orange-300 border border-orange-500/25" : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"}`}>
                      {f === "all" ? t.projects.all : f === "open" ? "Open" : "Closed"}
                    </button>
                  ))}
                </div>
                <select value={issueSort} onChange={(e) => setIssueSort(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-xs focus:outline-none">
                  <option value="created">{t.lang === "it" ? "Più recenti" : "Newest"}</option>
                  <option value="updated">{t.lang === "it" ? "Ultima modifica" : "Recently updated"}</option>
                </select>
              </div>

              {issuesLoading && issues.length === 0 ? (
                <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
              ) : (
                <div className="space-y-2">
                  {filteredIssues.map((issue, index) => {
                    const isOpen = issue.state === "open";
                    return (
                      <motion.a key={issue.id} href={issue.html_url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }} className="group flex items-start gap-3 bg-white/[0.03] border border-white/[0.08] rounded-xl p-3.5 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all">
                        <div className="shrink-0 mt-0.5">
                          {isOpen ? (
                            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" className="text-green-400"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" /><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Z" /></svg>
                          ) : (
                            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" className="text-purple-400"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" /></svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white group-hover:text-orange-300 transition-colors">{issue.title}</span>
                            {issue.labels.map((l) => (
                              <span key={l.name} className="px-1.5 py-0.5 text-[10px] rounded-full border" style={{ backgroundColor: `#${l.color}18`, borderColor: `#${l.color}40`, color: `#${l.color}` }}>{l.name}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-600 flex-wrap">
                            <a href={issue.repo_html_url} target="_blank" rel="noopener noreferrer" className="text-purple-400/70 hover:text-purple-300 font-medium" onClick={(e) => e.stopPropagation()}>{issue.repo_name}</a>
                            <span>#{issue.number}</span>
                            <span>{isOpen ? "opened" : "closed"} {ago(issue.created_at)}</span>
                            <span className="flex items-center gap-1"><img src={issue.user_avatar} alt={issue.user_login} className="w-3.5 h-3.5 rounded-full" />{issue.user_login}</span>
                          </div>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>
              )}

              {filteredIssues.length === 0 && !issuesLoading && <div className="text-center py-12"><p className="text-gray-600 text-sm">{t.issues.none}</p></div>}
            </motion.div>
          )}

          {/* ORGS TAB */}
          {activeTab === "orgs" && (
            <motion.div key="orgs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {orgsLoading && orgs.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : orgs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-sm mb-2">{t.orgs.none}</p>
                  <p className="text-gray-700 text-xs max-w-md mx-auto">
                    {t.lang === "it"
                      ? "Solo le organizzazioni con membership pubblica sono visibili tramite API GitHub senza autenticazione."
                      : "Only organizations with public membership are visible via unauthenticated GitHub API."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orgs.map((org, index) => (
                    <motion.a key={org.id} href={org.html_url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="group flex items-center gap-4 bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all">
                      <img src={org.avatar_url} alt={org.login} className="w-14 h-14 rounded-xl border border-white/10 object-cover" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">{org.login}</h3>
                        {org.description && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{org.description}</p>}
                      </div>
                      <ExternalLink size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </motion.a>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
