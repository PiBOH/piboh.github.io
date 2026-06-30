import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useGitHub } from "../context/GitHubContext";

export default function SyncBanner() {
  const { reposLoading, issuesLoading, error, lastUpdated } = useGitHub();
  const isSyncing = reposLoading || issuesLoading;

  if (error && !isSyncing) {
    return (
      <div className="fixed top-14 left-0 right-0 z-40 px-4">
        <div className="max-w-6xl mx-auto bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle size={14} />
          <span className="truncate">{error}</span>
        </div>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="fixed top-14 left-0 right-0 z-40 px-4">
        <div className="max-w-6xl mx-auto bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2 flex items-center gap-2 text-yellow-400 text-xs">
          <RefreshCw size={14} className="animate-spin" />
          <span>Sync...</span>
        </div>
      </div>
    );
  }

  if (lastUpdated) {
    return (
      <div className="fixed top-14 left-0 right-0 z-40 px-4">
        <div className="max-w-6xl mx-auto bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 flex items-center gap-2 text-green-400 text-xs">
          <CheckCircle2 size={14} />
          <span>Synced {lastUpdated.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
    );
  }

  return null;
}
