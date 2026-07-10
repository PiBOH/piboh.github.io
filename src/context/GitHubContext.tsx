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
  owner?: { login: string; avatar_url: string };
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
  starred: Project[];
  orgs: Org[];
  issues: Issue[];
  userLoading: boolean;
  reposLoading: boolean;
  starredLoading: boolean;
  issuesLoading: boolean;
  orgsLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  syncStatus: SyncStatus;
  refreshStarred: () => Promise<void>;
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

const GitHubContext = createContext<GitHubState | null>(null);

export function useGitHub() {
  const ctx = useContext(GitHubContext);
  if (!ctx) throw new Error("useGitHub must be used within GitHubProvider");
  return ctx;
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { headers: { Accept: "application/vnd.github.v3+json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
    owner: r.owner ? { login: r.owner.login, avatar_url: r.owner.avatar_url } : undefined,
  }));
}

async function fetchStarred(): Promise<Project[]> {
  const data = await fetchJson("https://api.github.com/users/PiBOH/starred?per_page=100&sort=updated");
  return data.map((r: any) => ({
    id: r.id, name: r.name, description: r.description, language: r.language,
    homepage: r.homepage, html_url: r.html_url, topics: r.topics || [],
    fork: r.fork, archived: r.archived, default_branch: r.default_branch || "main",
    open_issues_count: r.open_issues_count || 0, stargazers_count: r.stargazers_count || 0,
    forks_count: r.forks_count || 0, updated_at: r.updated_at, private: r.private || false,
    owner: r.owner ? { login: r.owner.login, avatar_url: r.owner.avatar_url } : undefined,
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
  const [user, setUser] = useState<UserInfo>(defaultUser);
  const [repos, setRepos] = useState<Project[]>([]);
  const [starred, setStarred] = useState<Project[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [reposLoading, setReposLoading] = useState(true);
  const [starredLoading, setStarredLoading] = useState(false);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshUser = useCallback(async () => {
    setUserLoading(true); setError(null);
    try { setUser(await fetchUser()); }
    catch (e: any) { setError(e.message); }
    finally { setUserLoading(false); }
  }, []);

  const refreshRepos = useCallback(async () => {
    setReposLoading(true); setError(null);
    try { setRepos(await fetchRepos()); }
    catch (e: any) { setError(e.message); }
    finally { setReposLoading(false); }
  }, []);

  const refreshStarred = useCallback(async () => {
    setStarredLoading(true); setError(null);
    try { setStarred(await fetchStarred()); }
    catch (e: any) { setError(e.message); }
    finally { setStarredLoading(false); }
  }, []);

  const refreshIssues = useCallback(async () => {
    setIssuesLoading(true); setError(null);
    try { setIssues(await fetchIssues()); }
    catch (e: any) { setError(e.message); }
    finally { setIssuesLoading(false); }
  }, []);

  const refreshOrgs = useCallback(async () => {
    setOrgsLoading(true); setError(null);
    try { setOrgs(await fetchOrgs()); }
    catch (e: any) { setError(e.message); }
    finally { setOrgsLoading(false); }
  }, []);

  // Initial eager load: user + repos + starred + issues
  useEffect(() => {
    refreshUser(); refreshRepos(); refreshStarred(); refreshIssues();
  }, [refreshUser, refreshRepos, refreshStarred, refreshIssues]);

  // Auto-refresh every 360s: repos + starred + issues (eager)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshRepos(); refreshStarred(); refreshIssues();
      setLastUpdated(new Date());
    }, 360_000);
    return () => clearInterval(interval);
  }, [refreshRepos, refreshStarred, refreshIssues]);

  const isLoading = userLoading || reposLoading || starredLoading || issuesLoading || orgsLoading;
  const syncStatus: SyncStatus = error && !isLoading ? "error" : isLoading ? "syncing" : lastUpdated ? "live" : "cache";

  const value: GitHubState = {
    user, repos, starred, orgs, issues,
    userLoading, reposLoading, starredLoading, issuesLoading, orgsLoading,
    error, lastUpdated, syncStatus, refreshStarred, refreshOrgs,
  };

  return (
    <GitHubContext.Provider value={value}>
      {children}
    </GitHubContext.Provider>
  );
}
