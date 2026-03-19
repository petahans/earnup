import { useState, useEffect } from "react";

const ACCENT = "#E8294C";
const ACCENT2 = "#FF6B6B";
const ACCENT_GLOW = "rgba(232,41,76,0.12)";
const ACCENT_BORDER = "rgba(232,41,76,0.3)";
const BG = "#13141A";
const BG2 = "#1A1B23";
const BG3 = "#1E1F29";
const BORDER = "#2A2B38";

const tasks = [
  { id: 1, type: "game", title: "Coin Rush", desc: "Erreiche Level 5", reward: 250, time: "10 Min", rating: 5, bg: "linear-gradient(135deg, #1a0a2e, #2d1b69)" },
  { id: 2, type: "game", title: "Bubble Pop", desc: "3 Runden ohne Fehler", reward: 150, time: "7 Min", rating: 4, bg: "linear-gradient(135deg, #0a1a2e, #1b3a69)" },
  { id: 3, type: "game", title: "Match Master", desc: "10 Züge in Folge lösen", reward: 175, time: "8 Min", rating: 4, bg: "linear-gradient(135deg, #1a2e0a, #3a6921)" },
  { id: 4, type: "survey", title: "CPX Research", desc: "Bezahlte Meinungsumfragen", reward: 120, time: "3 Min", rating: 5, bg: "linear-gradient(135deg, #0d1f2d, #1a3a4a)" },
  { id: 5, type: "survey", title: "Pollfish", desc: "Kurze tägliche Umfragen", reward: 80, time: "2 Min", rating: 3, bg: "linear-gradient(135deg, #2d0a0a, #691b1b)" },
  { id: 6, type: "survey", title: "YourSurveys", desc: "Produkttest & Feedback", reward: 200, time: "5 Min", rating: 5, bg: "linear-gradient(135deg, #1a0a2e, #4a1b69)" },
];

const cashRewards = [
  { id: "paypal", label: "PayPal", bg: "linear-gradient(135deg, #003087, #009cde)", textColor: "#fff", minCoins: 500, symbol: "P" },
  { id: "bitcoin", label: "Bitcoin", bg: "linear-gradient(135deg, #f7931a, #ffb347)", textColor: "#fff", minCoins: 1000, symbol: "₿" },
];

const giftRewards = [
  { id: "amazon", label: "Amazon", bg: "linear-gradient(135deg, #131921, #232f3e)", textColor: "#FF9900", minCoins: 800, symbol: "a" },
  { id: "steam", label: "Steam", bg: "linear-gradient(135deg, #1b2838, #2a475e)", textColor: "#66c0f4", minCoins: 700, symbol: "S" },
  { id: "netflix", label: "Netflix", bg: "linear-gradient(135deg, #141414, #e50914)", textColor: "#fff", minCoins: 1200, symbol: "N" },
  { id: "spotify", label: "Spotify", bg: "linear-gradient(135deg, #121212, #1db954)", textColor: "#1db954", minCoins: 900, symbol: "♫" },
];

const leaderboard = [
  { rank: 1, name: "Lisa M.", coins: 12400, avatar: "L" },
  { rank: 2, name: "Tom K.", coins: 10850, avatar: "T" },
  { rank: 3, name: "Sara B.", coins: 8990, avatar: "S" },
  { rank: 4, name: "Max R.", coins: 7200, avatar: "M" },
  { rank: 5, name: "Nina W.", coins: 5400, avatar: "N" },
];

const navItems = [
  { id: "earn", icon: "🎮", label: "Aufgaben" },
  { id: "cashout", icon: "💸", label: "Auszahlen" },
  { id: "leaderboard", icon: "🏆", label: "Rangliste" },
];

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 860);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 860);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

export default function Dashboard({ user, onLogout }) {
  const [activeNav, setActiveNav] = useState("earn");
  const [completedTasks, setCompletedTasks] = useState([]);
  const [coins, setCoins] = useState(user?.coins || 0);
  const [toast, setToast] = useState(null);
  const isMobile = useIsMobile();

  const completeTask = async (task) => {
    if (completedTasks.includes(task.id)) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://earnup-udhe.onrender.com/api/auth/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ taskId: String(task.id), reward: task.reward }),
      });
      const data = await res.json();
      if (res.ok) { setCompletedTasks(prev => [...prev, task.id]); setCoins(data.coins); showToast(`+${task.reward} Coins verdient! 🎉`); }
    } catch {
      setCompletedTasks(prev => [...prev, task.id]); setCoins(c => c + task.reward); showToast(`+${task.reward} Coins verdient! 🎉`);
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:${BG}} ::-webkit-scrollbar-thumb{background:${BORDER};border-radius:2px}
      `}</style>
      {toast && <div style={S.toast}>{toast}</div>}

      {!isMobile && (
        <aside style={S.sidebar}>
          <div style={S.logo}><div style={S.logoIcon}>⚡</div><span style={S.logoText}>EarnUp</span></div>
          <nav style={S.nav}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveNav(item.id)} style={{ ...S.navBtn, ...(activeNav === item.id ? S.navBtnActive : {}) }}>
                <span style={S.navBtnIcon}>{item.icon}</span><span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div style={S.sidebarCoins}>
            <div style={S.sidebarCoinsLabel}>Deine Coins</div>
            <div style={S.sidebarCoinsVal}>⚡ {coins.toLocaleString()}</div>
          </div>
          <div style={S.sidebarUser}>
            <div style={S.sidebarAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={S.sidebarUserInfo}>
              <div style={S.sidebarUserName}>{user?.name}</div>
              <button onClick={onLogout} style={S.logoutBtn}>Abmelden</button>
            </div>
          </div>
        </aside>
      )}

      <main style={S.main}>
        <div style={S.topbar}>
          {isMobile ? <div style={S.logo}><div style={{ ...S.logoIcon, width: 28, height: 28, fontSize: 14 }}>⚡</div><span style={{ ...S.logoText, fontSize: 18 }}>EarnUp</span></div>
            : <div style={S.topbarTitle}>{navItems.find(n => n.id === activeNav)?.label}</div>}
          <div style={S.topbarRight}>
            <div style={S.topbarCoins}>⚡ {coins.toLocaleString()}</div>
            <div style={S.topbarAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
          </div>
        </div>
        <div style={S.page}>
          {activeNav === "earn" && <EarnPage tasks={tasks} completedTasks={completedTasks} completeTask={completeTask} />}
          {activeNav === "cashout" && <CashoutPage cashRewards={cashRewards} giftRewards={giftRewards} coins={coins} showToast={showToast} />}
          {activeNav === "leaderboard" && <LeaderboardPage leaderboard={leaderboard} coins={coins} user={user} />}
        </div>
        {isMobile && (
          <nav style={S.mobileNav}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveNav(item.id)} style={{ ...S.mobileNavBtn, ...(activeNav === item.id ? S.mobileNavBtnActive : {}) }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 10, marginTop: 2 }}>{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </main>
    </div>
  );
}

function EarnPage({ tasks, completedTasks, completeTask }) {
  const [filter, setFilter] = useState("Alle");
  const filters = ["Alle", "Spiele", "Umfragen"];
  const filtered = filter === "Alle" ? tasks : filter === "Spiele" ? tasks.filter(t => t.type === "game") : tasks.filter(t => t.type === "survey");
  const games = filtered.filter(t => t.type === "game");
  const surveys = filtered.filter(t => t.type === "survey");
  return (
    <div style={{ animation: "fadeIn 0.3s ease both" }}>
      <div style={S.filterRow}>
        {filters.map(f => <button key={f} onClick={() => setFilter(f)} style={{ ...S.filterBtn, ...(filter === f ? S.filterBtnActive : {}) }}>{f}</button>)}
      </div>
      {games.length > 0 && <><div style={S.sectionLabel}><span>🎮</span> Spiele</div><div style={S.offerGrid}>{games.map(t => <OfferCard key={t.id} task={t} done={completedTasks.includes(t.id)} onComplete={completeTask} />)}</div></>}
      {surveys.length > 0 && <><div style={{ ...S.sectionLabel, marginTop: 28 }}><span>📋</span> Umfragen</div><div style={S.offerGrid}>{surveys.map(t => <OfferCard key={t.id} task={t} done={completedTasks.includes(t.id)} onComplete={completeTask} />)}</div></>}
    </div>
  );
}

function OfferCard({ task, done, onComplete }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < task.rating ? "★" : "☆").join("");
  return (
    <div style={{ ...S.offerCard, opacity: done ? 0.6 : 1 }} onClick={() => !done && onComplete(task)}>
      <div style={{ ...S.offerCardBg, background: task.bg }}>
        <div style={S.offerCardIcon}>{task.type === "game" ? "🎮" : "📋"}</div>
        {done && <div style={S.doneBadge}>✓</div>}
      </div>
      <div style={S.offerCardBody}>
        <div style={S.offerCardTitle}>{task.title}</div>
        <div style={S.offerCardDesc}>{task.desc}</div>
        <div style={S.offerCardStars}>{stars}</div>
        <div style={S.offerCardFooter}>
          <span style={S.offerCardTime}>⏱ {task.time}</span>
          <span style={S.offerCardReward}>+⚡{task.reward}</span>
        </div>
      </div>
    </div>
  );
}

function CashoutPage({ cashRewards, giftRewards, coins, showToast }) {
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const handleRedeem = (r) => {
    if (coins < r.minCoins) { showToast("Nicht genug Coins!"); return; }
    showToast(`${r.label} Auszahlung gestartet! 🎉`);
    setSelected(null); setAmount("");
  };
  return (
    <div style={{ animation: "fadeIn 0.3s ease both" }}>
      <div style={S.cashoutHeader}>
        <div style={S.cashoutTitle}>Cashout</div>
        <div style={S.cashoutSub}>Löse deine verdienten Coins ein! Mindestens ⚡500 Coins erforderlich.</div>
      </div>
      <div style={S.balanceBox}><div style={S.balanceLabel}>Dein Guthaben</div><div style={S.balanceVal}>⚡ {coins.toLocaleString()} Coins</div></div>
      <div style={S.cashSectionLabel}><span>💸</span> Cash auszahlen</div>
      <div style={S.cashGrid}>{cashRewards.map(r => <CashCard key={r.id} r={r} coins={coins} onSelect={() => setSelected(r)} selected={selected?.id === r.id} />)}</div>
      <div style={{ ...S.cashSectionLabel, marginTop: 32 }}><span>🎁</span> Gutscheine auszahlen</div>
      <div style={S.cashGrid}>{giftRewards.map(r => <CashCard key={r.id} r={r} coins={coins} onSelect={() => setSelected(r)} selected={selected?.id === r.id} />)}</div>
      {selected && (
        <div style={S.modalOverlay} onClick={() => setSelected(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ ...S.modalIcon, background: selected.bg }}><span style={{ color: selected.textColor }}>{selected.symbol}</span></div>
            <div style={S.modalTitle}>{selected.label} einlösen</div>
            <div style={S.modalSub}>Mindestbetrag: ⚡ {selected.minCoins.toLocaleString()} Coins</div>
            <div style={S.modalBalance}>Verfügbar: ⚡ {coins.toLocaleString()}</div>
            <input style={S.modalInput} placeholder="Betrag in Coins eingeben" value={amount} onChange={e => setAmount(e.target.value)} />
            <div style={S.modalBtns}>
              <button onClick={() => setSelected(null)} style={S.modalCancelBtn}>Abbrechen</button>
              <button onClick={() => handleRedeem(selected)} style={S.modalConfirmBtn}>Einlösen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CashCard({ r, coins, onSelect, selected }) {
  const can = coins >= r.minCoins;
  return (
    <div onClick={onSelect} style={{ ...S.cashCard, background: r.bg, opacity: can ? 1 : 0.5, border: selected ? `2px solid ${ACCENT}` : "2px solid transparent", cursor: "pointer" }}>
      <div style={{ ...S.cashCardSymbol, color: r.textColor }}>{r.symbol}</div>
      <div style={S.cashCardLabel}>{r.label}</div>
      <div style={S.cashCardMin}>ab ⚡{r.minCoins.toLocaleString()}</div>
    </div>
  );
}

function LeaderboardPage({ leaderboard, coins, user }) {
  const medals = ["🥇", "🥈", "🥉"];
  const top3 = [leaderboard[1], leaderboard[0], leaderboard[2]];
  return (
    <div style={{ animation: "fadeIn 0.3s ease both" }}>
      <div style={S.cashoutHeader}><div style={S.cashoutTitle}>🏆 Rangliste</div><div style={S.cashoutSub}>Die aktivsten Nutzer dieser Woche</div></div>
      <div style={S.podium}>
        {top3.map((e, i) => (
          <div key={e.rank} style={{ ...S.podiumItem, transform: i === 1 ? "scale(1.1)" : "scale(0.95)" }}>
            <div style={S.podiumMedal}>{medals[e.rank - 1]}</div>
            <div style={{ ...S.podiumAvatar, background: e.rank === 1 ? `linear-gradient(135deg,${ACCENT},${ACCENT2})` : BG3 }}>{e.avatar}</div>
            <div style={S.podiumName}>{e.name}</div>
            <div style={S.podiumCoins}>⚡ {e.coins.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div style={S.leaderList}>
        {leaderboard.map(e => {
          const isMe = e.name === user?.name;
          return (
            <div key={e.rank} style={{ ...S.leaderRow, ...(isMe ? S.leaderRowMe : {}) }}>
              <span style={S.leaderRank}>{medals[e.rank - 1] || `#${e.rank}`}</span>
              <div style={{ ...S.leaderAvatar, background: isMe ? `linear-gradient(135deg,${ACCENT},${ACCENT2})` : BG3 }}>{e.avatar}</div>
              <span style={S.leaderName}>{e.name}{isMe && <span style={S.youBadge}>Du</span>}</span>
              <span style={S.leaderCoins}>⚡ {e.coins.toLocaleString()}</span>
            </div>
          );
        })}
        <div style={{ ...S.leaderRow, ...S.leaderRowMe }}>
          <span style={S.leaderRank}>#?</span>
          <div style={{ ...S.leaderAvatar, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})` }}>{user?.name?.[0]}</div>
          <span style={S.leaderName}>{user?.name}<span style={S.youBadge}>Du</span></span>
          <span style={S.leaderCoins}>⚡ {coins.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

const S = {
  root: { display: "flex", minHeight: "100vh", background: BG, fontFamily: "'Outfit',sans-serif", color: "#E2E2F0" },
  sidebar: { width: 200, background: BG2, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0 },
  logo: { display: "flex", alignItems: "center", gap: 10, padding: "22px 20px", borderBottom: `1px solid ${BORDER}` },
  logoIcon: { width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  logoText: { fontSize: 20, fontWeight: 800, color: "#fff" },
  nav: { display: "flex", flexDirection: "column", gap: 2, padding: "12px 10px", flex: 1 },
  navBtn: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "inherit" },
  navBtnActive: { background: ACCENT_GLOW, color: "#fff", fontWeight: 600, borderLeft: `3px solid ${ACCENT}` },
  navBtnIcon: { fontSize: 18 },
  sidebarCoins: { margin: "0 10px 12px", background: ACCENT_GLOW, border: `1px solid ${ACCENT_BORDER}`, borderRadius: 10, padding: "12px 14px" },
  sidebarCoinsLabel: { fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  sidebarCoinsVal: { fontSize: 18, fontWeight: 800, color: "#fff" },
  sidebarUser: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderTop: `1px solid ${BORDER}` },
  sidebarAvatar: { width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff", flexShrink: 0 },
  sidebarUserInfo: { minWidth: 0 },
  sidebarUserName: { fontSize: 13, fontWeight: 700, color: "#eee", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  logoutBtn: { background: "none", border: "none", color: "#555", fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: 0 },
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: `1px solid ${BORDER}`, background: BG, position: "sticky", top: 0, zIndex: 10 },
  topbarTitle: { fontSize: 18, fontWeight: 700, color: "#fff" },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  topbarCoins: { background: ACCENT_GLOW, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT, padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 },
  topbarAvatar: { width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff" },
  page: { flex: 1, padding: "24px", overflowY: "auto", paddingBottom: 80 },
  filterRow: { display: "flex", gap: 8, marginBottom: 24 },
  filterBtn: { padding: "7px 18px", borderRadius: 20, border: `1px solid ${BORDER}`, background: BG2, color: "#777", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  filterBtnActive: { background: ACCENT_GLOW, color: "#fff", border: `1px solid ${ACCENT_BORDER}` },
  sectionLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16 },
  offerGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: 14 },
  offerCard: { background: BG2, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", cursor: "pointer" },
  offerCardBg: { height: 120, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  offerCardIcon: { fontSize: 44 },
  doneBadge: { position: "absolute", top: 8, right: 8, background: ACCENT, color: "#fff", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 },
  offerCardBody: { padding: "12px 14px" },
  offerCardTitle: { fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 },
  offerCardDesc: { fontSize: 12, color: "#666", marginBottom: 8, lineHeight: 1.4 },
  offerCardStars: { color: "#FFB347", fontSize: 12, marginBottom: 8 },
  offerCardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  offerCardTime: { fontSize: 11, color: "#555" },
  offerCardReward: { fontSize: 14, fontWeight: 800, color: "#fff" },
  cashoutHeader: { marginBottom: 20 },
  cashoutTitle: { fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 },
  cashoutSub: { fontSize: 14, color: "#666", lineHeight: 1.5 },
  balanceBox: { background: ACCENT_GLOW, border: `1px solid ${ACCENT_BORDER}`, borderRadius: 12, padding: "16px 20px", marginBottom: 28, display: "inline-block" },
  balanceLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  balanceVal: { fontSize: 24, fontWeight: 800, color: "#fff" },
  cashSectionLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16 },
  cashGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 },
  cashCard: { borderRadius: 14, padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  cashCardSymbol: { fontSize: 42, fontWeight: 900 },
  cashCardLabel: { fontSize: 14, fontWeight: 700, color: "#fff" },
  cashCardMin: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modal: { background: BG2, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "32px", maxWidth: 380, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  modalIcon: { width: 72, height: 72, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, marginBottom: 4 },
  modalTitle: { fontSize: 20, fontWeight: 800, color: "#fff" },
  modalSub: { fontSize: 13, color: "#888" },
  modalBalance: { fontSize: 13, color: ACCENT, fontWeight: 700 },
  modalInput: { width: "100%", background: BG3, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 16px", color: "#eee", fontSize: 14, fontFamily: "inherit", outline: "none" },
  modalBtns: { display: "flex", gap: 10, width: "100%", marginTop: 4 },
  modalCancelBtn: { flex: 1, padding: "11px", background: BG3, border: `1px solid ${BORDER}`, borderRadius: 10, color: "#888", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  modalConfirmBtn: { flex: 1, padding: "11px", background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  podium: { display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, marginBottom: 28, marginTop: 8 },
  podiumItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  podiumMedal: { fontSize: 28 },
  podiumAvatar: { width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: "#fff" },
  podiumName: { fontSize: 13, fontWeight: 700, color: "#eee" },
  podiumCoins: { fontSize: 11, color: "#666" },
  leaderList: { display: "flex", flexDirection: "column", gap: 8 },
  leaderRow: { display: "flex", alignItems: "center", gap: 12, background: BG2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 16px" },
  leaderRowMe: { border: `1px solid ${ACCENT_BORDER}`, background: ACCENT_GLOW },
  leaderRank: { fontSize: 18, width: 30, textAlign: "center" },
  leaderAvatar: { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: "#fff", flexShrink: 0 },
  leaderName: { flex: 1, fontWeight: 600, fontSize: 14, color: "#ddd" },
  leaderCoins: { fontWeight: 700, fontSize: 14, color: "#fff" },
  youBadge: { background: ACCENT, color: "#fff", fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 4, marginLeft: 6 },
  mobileNav: { position: "fixed", bottom: 0, left: 0, right: 0, background: BG2, borderTop: `1px solid ${BORDER}`, display: "flex", zIndex: 100 },
  mobileNavBtn: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 8px", background: "transparent", border: "none", color: "#555", cursor: "pointer", fontFamily: "inherit" },
  mobileNavBtnActive: { color: ACCENT },
  toast: { position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, color: "#fff", padding: "10px 24px", borderRadius: 30, fontWeight: 700, fontSize: 14, zIndex: 9999, whiteSpace: "nowrap", animation: "toastIn 0.3s ease both" },
};
