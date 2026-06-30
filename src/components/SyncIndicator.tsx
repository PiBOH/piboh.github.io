import { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useGitHub } from "../context/GitHubContext";

export default function SyncIndicator() {
  const { reposLoading, issuesLoading, error, lastUpdated } = useGitHub();
  const [hovered, setHovered] = useState(false);
  const isSyncing = reposLoading || issuesLoading;

  let icon = <CheckCircle2 size={14} className="text-green-400" />;
  let bg = "bg-green-500/10 border-green-500/20";
  let label = lastUpdated ? lastUpdated.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) : "Ready";

  if (error && !isSyncing) {
    icon = <AlertCircle size={14} className="text-red-400" />;
    bg = "bg-red-500/10 border-red-500/20";
    label = "Error";
  } else if (isSyncing) {
    icon = <RefreshCw size={14} className="text-yellow-400 animate-spin" />;
    bg = "bg-yellow-500/10 border-yellow-500/20";
    label = "Syncing...";
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full border backdrop-blur-md transition-all duration-300 ${bg} ${hovered ? "bg-opacity-20" : "bg-opacity-10"}`}>
        {icon}
        <span className={`text-xs text-gray-400 transition-all duration-300 ${hovered ? "max-w-[200px] opacity-100 ml-1" : "max-w-0 opacity-0 ml-0 overflow-hidden"}`}>
          {label}
        </span>
      </div>
    </div>
  );
}
