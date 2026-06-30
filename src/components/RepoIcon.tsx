import { useState } from "react";
import { languageColors } from "../context/GitHubContext";

interface RepoIconProps {
  repoName: string;
  language: string | null;
  defaultBranch?: string;
}

export default function RepoIcon({ repoName, language, defaultBranch = "main" }: RepoIconProps) {
  const [imgError, setImgError] = useState(false);
  const color = languageColors[language || "null"] || "#8b949e";
  const bgColor = `${color}20`;

  const iconUrl = `https://raw.githubusercontent.com/PiBOH/${repoName}/${defaultBranch}/icon.png`;
  const logoUrl = `https://raw.githubusercontent.com/PiBOH/${repoName}/${defaultBranch}/logo.png`;

  const [currentUrl, setCurrentUrl] = useState(iconUrl);
  const [triedLogo, setTriedLogo] = useState(false);

  const handleError = () => {
    if (!triedLogo) {
      setTriedLogo(true);
      setCurrentUrl(logoUrl);
    } else {
      setImgError(true);
    }
  };

  if (imgError) {
    return (
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
        style={{ backgroundColor: bgColor, color }}
      >
        {repoName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
      style={{ backgroundColor: bgColor }}
    >
      <img
        src={currentUrl}
        alt={`${repoName} icon`}
        className="w-8 h-8 object-contain"
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
}
