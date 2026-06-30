import { RefreshCw, Wifi, WifiOff, Database, AlertCircle } from "lucide-react";
import { useGitHub } from "../context/GitHubContext";

const statusConfig = {
  syncing: { icon: RefreshCw, text: "Sync", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", animate: true },
  live: { icon: Wifi, text: "Live", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", animate: false },
  cache: { icon: Database, text: "Cache", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", animate: false },
  error: { icon: AlertCircle, text: "Error", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", animate: false },
};

export default function SyncBadge() {
  const { syncStatus, lastUpdated, error } = useGitHub();
  const config = statusConfig[syncStatus];
  const Icon = config.icon;

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Error toast */}
      {error && (
        <div className="max-w-xs px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Status badge */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 ${config.bg} ${config.border} border rounded-full backdrop-blur-md`}
        title={lastUpdated ? `Ultimo aggiornamento: ${timeStr}` : "In attesa di sincronizzazione..."}
      >
        <Icon size={12} className={`${config.color} ${config.animate ? "animate-spin" : ""}`} />
        <span className={`text-[11px] font-medium ${config.color}`}>{config.text}</span>
        <span className="text-[10px] text-gray-600 tabular-nums">{timeStr}</span>
      </div>
    </div>
  );
}
