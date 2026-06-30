(function() {
"use strict";

const USER = "PiBOH";
const API = "https://api.github.com";
const POLL = 60000;

// --- shortcuts ---
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const id = s => document.getElementById(s);

// --- DOM refs ---
const dom = {
  avatar: id("avatar"),
  pName: id("p-name"),
  pUser: id("p-username"),
  pBio: id("p-bio"),
  pFol: id("p-followers"),
  pFing: id("p-following"),
  pRepos: id("p-repos"),
  pMeta: id("p-meta"),
  pLink: id("p-link"),
  repoBadge: id("repo-badge"),
  issueBadge: id("issue-badge"),
  repoGrid: id("repo-grid"),
  repoEmpty: id("repo-empty"),
  issueGrid: id("issue-grid"),
  issueEmpty: id("issue-empty"),
  repoSection: id("repos-section"),
  issueSection: id("issues-section"),
  repoSearch: id("repo-search"),
  repoSel: id("repo-sort"),
  issueSearch: id("issue-search"),
  issueSel: id("issue-sort"),
  sync: id("sync-indicator"),
  syncLbl: id("sync-label"),
  toast: id("toast"),
  year: id("year"),
  clock: id("clock"),
  updated: id("updated")
};

// --- state ---
let repos = [];
let issues = [];
let prevRepoIds = new Set();
let prevIssueIds = new Set();
let prevAvatar = "";
let repoFilter = "all", repoSelVal = "updated", repoQ = "";
let issueFilter = "all", issueSelVal = "created", issueQ = "";

// --- helpers ---
function ago(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = 60000, h = 3600000, dy = 86400000, w = 604800000, mo = 2592000000;
  if (diff < m) return "ora";
  if (diff < h) return Math.round(diff/m)+"m";
  if (diff < dy) return Math.round(diff/h)+"h";
  if (diff < w) return Math.round(diff/dy)+"g";
  if (diff < mo) return Math.round(diff/w)+"sett";
  return new Date(d).toLocaleDateString("it");
}
function fmt(n) {
  if (n >= 1e6) return (n/1e6).toFixed(1)+"M";
  if (n >= 1e3) return (n/1e3).toFixed(1)+"k";
  return ""+n;
}
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]); }

const LANG_COLORS = {
  JavaScript:"#f1e05a",TypeScript:"#3178c6",Python:"#3572A5",Java:"#b07219",
  Go:"#00ADD8",Rust:"#dea584",Ruby:"#701516",PHP:"#4F5D95",Swift:"#F05138",
  Kotlin:"#A97BFF",Dart:"#00B4AB",C:"#555","C++":"#f34b7d","C#":"#178600",
  HTML:"#e34c26",CSS:"#563d7c",SCSS:"#c6538c",Shell:"#89e051",Vue:"#41b883",
  Svelte:"#ff3e00",Dockerfile:"#384d54"
};
function lc(l) { return LANG_COLORS[l] || "#8b949e"; }

function isLight(h) {
  if (!h) return false;
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return (r*299+g*587+b*114)/1000 > 155;
}

// --- API ---
async function get(u) {
  const r = await fetch(u.startsWith("http") ? u : API+u);
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}
async function fetchUser() { try { return await get("/users/"+USER); } catch { return null; } }
async function fetchRepos(p) {
  try { return await get("/users/"+USER+"/repos?per_page=100&page="+p+"&sort=updated"); } catch { return []; }
}
async function fetchAllRepos() {
  let p = 1, all = [];
  while (true) {
    const d = await fetchRepos(p++);
    if (!d.length) break;
    all = all.concat(d);
    if (d.length < 100) break;
  }
  return all;
}
async function fetchIssues() {
  try {
    const d = await get("/search/issues?q=author:"+USER+"+is:issue&per_page=100&sort=created&order=desc");
    return d.items || [];
  } catch { return []; }
}

// --- render profile ---
function renderProfile(u) {
  if (!u) return;
  dom.pName.textContent = u.name || u.login;
  dom.pUser.textContent = "@"+u.login;
  dom.pBio.textContent = u.bio || "Nessuna bio.";
  dom.pFol.textContent = fmt(u.followers);
  dom.pFing.textContent = fmt(u.following);
  dom.pRepos.textContent = u.public_repos;
  dom.repoBadge.textContent = u.public_repos;
  dom.pLink.href = u.html_url;

  // avatar
  if (u.avatar_url && u.avatar_url !== prevAvatar) {
    dom.avatar.classList.add("loading");
    const img = new Image();
    img.onload = () => { dom.avatar.src = img.src; dom.avatar.classList.remove("loading"); };
    img.onerror = () => dom.avatar.classList.remove("loading");
    img.src = u.avatar_url+"?s=240";
    prevAvatar = u.avatar_url;
  }

  // meta
  let html = "";
  if (u.company) html += '<span class="mi"><svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M1.75 16A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 0 0 .25-.25V8.285a.25.25 0 0 0-.111-.208l-1.055-.703a.75.75 0 1 1 .832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0 1 14.25 16h-3.5a.75.75 0 0 1-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 0 1-.75-.75V14h-1v1.25a.75.75 0 0 1-.75.75h-3ZM4 4h4a.75.75 0 0 1 0 1.5H4A.75.75 0 0 1 4 4Z"/></svg> '+esc(u.company)+"</span>";
  if (u.location) html += '<span class="mi"><svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192 0Z"/></svg> '+esc(u.location)+"</span>";
  if (u.blog) {
    const b = u.blog.startsWith("http") ? u.blog : "https://"+u.blog;
    html += '<span class="mi"><svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25Z"/></svg> <a href="'+esc(b)+'" target="_blank">'+esc(u.blog)+"</a></span>";
  }
  if (u.twitter_username) html += '<span class="mi"><svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Z"/></svg> <a href="https://twitter.com/'+esc(u.twitter_username)+'" target="_blank">@'+esc(u.twitter_username)+"</a></span>";
  dom.pMeta.innerHTML = html;
}

// --- render repos ---
function mkRepo(r, i) {
  const el = document.createElement("div");
  el.className = "card";
  el.style.animationDelay = Math.min(i*35,400)+"ms";
  el.dataset.id = r.id;
  const fork = r.fork
    ? '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/></svg>'
    : '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8A2.5 2.5 0 0 1 2 11.5v-9Z"/></svg>';
  const lang = r.language ? '<span class="lang"><span class="dot" style="background:'+lc(r.language)+'"></span>'+r.language+"</span>" : "";
  const topics = r.topics && r.topics.length ? '<div class="topics">'+r.topics.map(t=>'<span class="topic">'+esc(t)+"</span>").join("")+"</div>" : "";
  el.innerHTML =
    '<div class="card-hd"><div class="nw">'+fork+'<a href="'+r.html_url+'" target="_blank">'+esc(r.name)+'</a><span class="vis">'+(r.private?"Privato":"Pubblico")+'</span></div></div>'+
    (r.description ? '<p class="card-desc">'+esc(r.description)+"</p>" : "")+
    '<div class="card-meta">'+lang+
    (r.stargazers_count ? '<span class="st"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg> '+fmt(r.stargazers_count)+"</span>" : "")+
    (r.forks_count ? '<span class="st"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/></svg> '+r.forks_count+"</span>" : "")+
    '<span>'+ago(r.updated_at)+"</span></div>"+
    topics;
  return el;
}

function applyRepos() {
  let r = [...repos];
  if (repoFilter === "source") r = r.filter(x => !x.fork);
  else if (repoFilter === "fork") r = r.filter(x => x.fork);
  if (repoQ) { const q = repoQ.toLowerCase(); r = r.filter(x => x.name.toLowerCase().includes(q) || (x.description && x.description.toLowerCase().includes(q))); }
  if (repoSelVal === "stars") r.sort((a,b) => b.stargazers_count - a.stargazers_count);
  else if (repoSelVal === "name") r.sort((a,b) => a.name.localeCompare(b.name));
  else r.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));
  dom.repoGrid.innerHTML = "";
  if (!r.length) { dom.repoEmpty.hidden = false; return; }
  dom.repoEmpty.hidden = true;
  r.forEach((x,i) => dom.repoGrid.appendChild(mkRepo(x,i)));
}

// --- render issues ---
function mkIssue(issue, i) {
  const el = document.createElement("div");
  el.className = "issue";
  el.style.animationDelay = Math.min(i*25,400)+"ms";
  const open = issue.state === "open";
  const ico = open
    ? '<svg class="ico open" viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Z"/></svg>'
    : '<svg class="ico closed" viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>';
  const rn = issue.repository_url ? issue.repository_url.split("/").slice(-2).join("/") : "";
  let lbls = "";
  if (issue.labels && issue.labels.length) {
    lbls = '<div class="lbls">'+issue.labels.map(l => {
      const bg = l.color ? "#"+l.color : "#8b949e";
      const fg = isLight(l.color) ? "#24292f" : "#fff";
      return '<span class="lbl" style="background:'+bg+";color:"+fg+'">'+esc(l.name)+"</span>";
    }).join("")+"</div>";
  }
  el.innerHTML =
    ico +
    '<div class="bd"><div class="tr"><span class="t"><a href="'+issue.html_url+'" target="_blank">'+esc(issue.title)+"</a></span>"+lbls+"</div>"+
    '<div class="meta"><a href="'+issue.repository_url.replace("api.github.com/repos","github.com")+'" class="rn">'+esc(rn)+'</a><span>#'+issue.number+'</span><span>'+(open?"aperta":"chiusa")+" "+ago(open?issue.created_at:issue.closed_at)+"</span>"+
    (issue.user ? "<span>da "+esc(issue.user.login)+"</span>" : "")+
    (issue.comments ? '<span class="cmt"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 1 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Z"/></svg> '+issue.comments+"</span>" : "")+
    "</div></div>";
  return el;
}

function applyIssues() {
  let r = [...issues];
  if (issueFilter === "open") r = r.filter(x => x.state === "open");
  else if (issueFilter === "closed") r = r.filter(x => x.state === "closed");
  if (issueQ) { const q = issueQ.toLowerCase(); r = r.filter(x => x.title.toLowerCase().includes(q) || (x.body && x.body.toLowerCase().includes(q))); }
  if (issueSelVal === "updated") r.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));
  else if (issueSelVal === "comments") r.sort((a,b) => b.comments - a.comments);
  else r.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  dom.issueGrid.innerHTML = "";
  if (!r.length) { dom.issueEmpty.hidden = false; return; }
  dom.issueEmpty.hidden = true;
  r.forEach((x,i) => dom.issueGrid.appendChild(mkIssue(x,i)));
}

// --- toast ---
let to;
function toast(msg, ms) {
  clearTimeout(to);
  dom.toast.textContent = msg;
  dom.toast.classList.add("show");
  to = setTimeout(() => dom.toast.classList.remove("show"), ms||3000);
}

// --- sync ---
function sync(state, label) {
  dom.sync.dataset.state = state;
  dom.syncLbl.textContent = label;
}

// --- refresh ---
async function refresh() {
  sync("syncing", "aggiorno...");
  try {
    const [u, rr, ii] = await Promise.all([fetchUser(), fetchAllRepos(), fetchIssues()]);
    if (u) renderProfile(u);
    if (rr.length) {
      const ids = new Set(rr.map(r => r.id));
      if (prevRepoIds.size) {
        const add = rr.filter(r => !prevRepoIds.has(r.id));
        if (add.length) toast("🆕 "+add.length+" nuovo/i repo");
        const rem = [...prevRepoIds].filter(id => !ids.has(id));
        if (rem.length) toast("🗑️ "+rem.length+" repo rimosso/i");
      }
      prevRepoIds = ids;
      repos = rr;
      dom.repoBadge.textContent = rr.length;
      applyRepos();
    }
    if (ii.length) {
      const ids = new Set(ii.map(x => x.id));
      if (prevIssueIds.size) {
        const add = ii.filter(x => !prevIssueIds.has(x.id));
        if (add.length) toast("🆕 "+add.length+" nuova/e issue");
      }
      prevIssueIds = ids;
      issues = ii;
      dom.issueBadge.textContent = ii.length;
      if (dom.issueSection.hidden === false) applyIssues();
    } else {
      dom.issueBadge.textContent = "0";
      dom.issueEmpty.hidden = false;
    }
    dom.updated.textContent = new Date().toLocaleTimeString("it", { hour:"2-digit", minute:"2-digit", second:"2-digit", timeZone:"Europe/Rome" });
    sync("live", "live");
  } catch (e) {
    console.error(e);
    sync("error", "errore API");
  }
}

// --- clock (always Rome) ---
function tick() {
  dom.clock.textContent = new Intl.DateTimeFormat("it", {
    timeZone: "Europe/Rome",
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false
  }).format(new Date());
}

// --- tabs ---
$$(".tab").forEach(t => {
  t.addEventListener("click", () => {
    $$(".tab").forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    const what = t.dataset.tab;
    dom.repoSection.hidden = what !== "repos";
    dom.issueSection.hidden = what !== "issues";
    if (what === "issues" && issues.length) applyIssues();
  });
});

// --- repo events ---
dom.repoSearch.addEventListener("input", () => {
  clearTimeout(dom._rs);
  dom._rs = setTimeout(() => { repoQ = dom.repoSearch.value.trim(); applyRepos(); }, 200);
});
$$(".fil").forEach(b => {
  b.addEventListener("click", () => {
    $$(".fil").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    repoFilter = b.dataset.f;
    applyRepos();
  });
});
dom.repoSel.addEventListener("change", () => { repoSelVal = dom.repoSel.value; applyRepos(); });

// --- issue events ---
dom.issueSearch.addEventListener("input", () => {
  clearTimeout(dom._is);
  dom._is = setTimeout(() => { issueQ = dom.issueSearch.value.trim(); applyIssues(); }, 200);
});
$$(".fil-i").forEach(b => {
  b.addEventListener("click", () => {
    $$(".fil-i").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    issueFilter = b.dataset.fi;
    applyIssues();
  });
});
dom.issueSel.addEventListener("change", () => { issueSelVal = dom.issueSel.value; applyIssues(); });

// --- init ---
dom.year.textContent = new Date().getFullYear();
tick();
setInterval(tick, 1000);
refresh();
setInterval(refresh, POLL);

})();
