import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface Project {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  homepage: string | null;
  html_url: string;
  topics: string[];
  fork: boolean;
  archived: boolean;
  default_branch: string;
  open_issues_count: number;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  private: boolean;
}

export interface UserInfo {
  login: string;
  name: string;
  bio: string;
  location: string;
  avatar_url: string;
  html_url: string;
  blog: string;
  public_repos: number;
  following: number;
  created_at: string;
}

export interface Org {
  id: number;
  login: string;
  avatar_url: string;
  description: string | null;
  html_url: string;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  repo_name: string;
  repo_html_url: string;
  user_login: string;
  user_avatar: string;
  labels: { name: string; color: string }[];
}

export type SyncStatus = "syncing" | "live" | "cache" | "error";

interface GitHubState {
  user: UserInfo | null;
  repos: Project[];
  orgs: Org[];
  issues: Issue[];
  userLoading: boolean;
  reposLoading: boolean;
  issuesLoading: boolean;
  orgsLoading: boolean;
  syncStatus: SyncStatus;
  error: string | null;
  errorType: "rate_limit" | "network" | "not_found" | "other" | null;
  lastUpdated: Date | null;
  refreshOrgs: () => Promise<void>;
}

export const languageColors: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3776ab", HTML: "#e34c26",
  Kotlin: "#a97bff", Java: "#b07219", CSS: "#563d7c", PowerShell: "#012456",
  "C#": "#178600", "C++": "#f34b7d", Go: "#00add8", Rust: "#dea584",
  Ruby: "#701516", PHP: "#4f5d95", Swift: "#ffac45", Dart: "#00b4ab",
  Shell: "#89e051", Vue: "#41b883", React: "#61dafb", null: "#8b949e",
};

const defaultUser: UserInfo = {
  login: "PiBOH", name: "Pietro Bonaldo", bio: "Per favore Non taggatemi in giro.",
  location: "Italia", avatar_url: "https://avatars.githubusercontent.com/u/291510898?v=4",
  html_url: "https://github.com/PiBOH", blog: "https://piboh.github.io/",
  public_repos: 27, following: 5, created_at: "2026-06-07",
};

const CACHE_KEY = "piboh-portfolio-cache";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheData {
  user?: UserInfo;
  repos?: Project[];
  issues?: Issue[];
  orgs?: Org[];
  timestamp: number;
}

function loadCache(): CacheData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as CacheData;
    if (Date.now() - data.timestamp > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function saveCache(data: Partial<CacheData>) {
  try {
    const existing = loadCache() || { timestamp: Date.now() };
    const merged = { ...existing, ...data, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
  } catch {
    // storage full or private mode
  }
}

const GitHubContext = createContext<GitHubState | null>(null);

export function useGitHub() {
  const ctx = useContext(GitHubContext);
  if (!ctx) throw new Error("useGitHub must be used within GitHubProvider");
  return ctx;
}

function classifyError(status: number, message: string): { type: GitHubState["errorType"]; msg: string } {
  if (status === 403 || message.includes("rate limit") || message.includes("API rate")) {
    return { type: "rate_limit", msg: "API Rate Limit raggiunto. I dati mostrati provengono dalla cache." };
  }
  if (status === 404) {
    return { type: "not_found", msg: "Utente o risorsa non trovata su GitHub." };
  }
  if (status === 0 || message.includes("fetch") || message.includes("network") || message.includes("Failed to fetch")) {
    return { type: "network", msg: "Errore di rete. Verifica la connessione internet." };
  }
  return { type: "other", msg: `Errore API (${status}): ${message}` };
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { headers: { Accept: "application/vnd.github.v3+json" } });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    (err as any).status = res.status;
    throw err;
  }
  return res.json();
}

async function fetchUser(): Promise<UserInfo> {
  const data = await fetchJson("https://api.github.com/users/PiBOH");
  return {
    login: data.login, name: data.name || data.login, bio: data.bio || "",
    location: data.location || "", avatar_url: data.avatar_url, html_url: data.html_url,
    blog: data.blog || "", public_repos: data.public_repos, following: data.following,
    created_at: data.created_at,
  };
}

async function fetchRepos(): Promise<Project[]> {
  const data = await fetchJson("https://api.github.com/users/PiBOH/repos?per_page=100&sort=updated");
  return data.map((r: any) => ({
    id: r.id, name: r.name, description: r.description, language: r.language,
    homepage: r.homepage, html_url: r.html_url, topics: r.topics || [],
    fork: r.fork, archived: r.archived, default_branch: r.default_branch,
    open_issues_count: r.open_issues_count, stargazers_count: r.stargazers_count || 0,
    forks_count: r.forks_count || 0, updated_at: r.updated_at, private: r.private || false,
  }));
}

async function fetchOrgs(): Promise<Org[]> {
  const data = await fetchJson("https://api.github.com/users/PiBOH/orgs");
  return data.map((o: any) => ({
    id: o.id, login: o.login, avatar_url: o.avatar_url,
    description: o.description, html_url: `https://github.com/${o.login}`,
  }));
}

async function fetchIssues(): Promise<Issue[]> {
  const data = await fetchJson(
    "https://api.github.com/search/issues?q=author:PiBOH+is:issue&per_page=100&sort=created&order=desc"
  );
  return (data.items || []).map((i: any) => {
    const repoUrl = i.repository_url || "";
    const repoParts = repoUrl.split("/");
    const repoName = repoParts.slice(-2).join("/");
    return {
      id: i.id, number: i.number, title: i.title, html_url: i.html_url,
      state: i.state, created_at: i.created_at,
      repo_name: repoName,
      repo_html_url: repoUrl.replace("api.github.com/repos", "github.com"),
      user_login: i.user?.login || "", user_avatar: i.user?.avatar_url || "",
      labels: (i.labels || []).map((l: any) => ({ name: l.name, color: l.color })),
    };
  });
}

export function GitHubProvider({ children }: { children: ReactNode }) {
  const cache = loadCache();

  const [user, setUser] = useState<UserInfo>(cache?.user || defaultUser);
  const [repos, setRepos] = useState<Project[]>(cache?.repos || []);
  const [orgs, setOrgs] = useState<Org[]>(cache?.orgs || []);
  const [issues, setIssues] = useState<Issue[]>(cache?.issues || []);
  const [userLoading, setUserLoading] = useState(!cache?.user);
  const [reposLoading, setReposLoading] = useState(!cache?.repos);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [issuesLoading, setIssuesLoading] = useState(!cache?.issues);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing");
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<GitHubState["errorType"]>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(cache ? new Date(cache.timestamp) : null);

  const handleError = useCallback((err: any, fallbackCacheKey: keyof CacheData, setter: (v: any) => void) => {
    const status = err?.status || 0;
    const classified = classifyError(status, err?.message || String(err));
    setError(classified.msg);
    setErrorType(classified.type);

    // Try cache fallback
    const c = loadCache();
    if (c && c[fallbackCacheKey]) {
      setter(c[fallbackCacheKey]);
      setSyncStatus("cache");
    } else {
      setSyncStatus("error");
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setUserLoading(true);
    setError(null);
    try {
      const u = await fetchUser();
      setUser(u);
      saveCache({ user: u });
    } catch (err: any) {
      handleError(err, "user", setUser);
    } finally {
      setUserLoading(false);
    }
  }, [handleError]);

  const refreshRepos = useCallback(async () => {
    setReposLoading(true);
    setError(null);
    try {
      const r = await fetchRepos();
      setRepos(r);
      saveCache({ repos: r });
      setSyncStatus((prev) => (prev === "cache" || prev === "error" ? prev : "live"));
    } catch (err: any) {
      handleError(err, "repos", setRepos);
    } finally {
      setReposLoading(false);
    }
  }, [handleError]);

  const refreshIssues = useCallback(async () => {
    setIssuesLoading(true);
    setError(null);
    try {
      const i = await fetchIssues();
      setIssues(i);
      saveCache({ issues: i });
      setSyncStatus((prev) => (prev === "cache" || prev === "error" ? prev : "live"));
    } catch (err: any) {
      handleError(err, "issues", setIssues);
    } finally {
      setIssuesLoading(false);
    }
  }, [handleError]);

  const refreshOrgs = useCallback(async () => {
    if (orgs.length > 0 && !orgsLoading) return;
    setOrgsLoading(true);
    setError(null);
    try {
      const o = await fetchOrgs();
      setOrgs(o);
      saveCache({ orgs: o });
    } catch (err: any) {
      handleError(err, "orgs", setOrgs);
    } finally {
      setOrgsLoading(false);
    }
  }, [orgs.length, orgsLoading, handleError]);

  // Initial eager load: user + repos + issues
  useEffect(() => {
    setSyncStatus("syncing");
    Promise.all([refreshUser(), refreshRepos(), refreshIssues()]).then(() => {
      setLastUpdated(new Date());
    });
  }, [refreshUser, refreshRepos, refreshIssues]);

  // Auto-refresh every 360s: repos + issues only
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus("syncing");
      Promise.all([refreshRepos(), refreshIssues()]).then(() => {
        setLastUpdated(new Date());
      });
    }, 360_000);
    return () => clearInterval(interval);
  }, [refreshRepos, refreshIssues]);

  const value: GitHubState = {
    user, repos, orgs, issues,
    userLoading, reposLoading, issuesLoading, orgsLoading,
    syncStatus, error, errorType, lastUpdated, refreshOrgs,
  };

  return (
    <GitHubContext.Provider value={value}>
      {children}
    </GitHubContext.Provider>
  );
}
