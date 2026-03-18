import { useState, useEffect } from "react";

const tasks = [
  { id: 1, type: "survey", title: "Kurze Meinungsumfrage", reward: 120, time: "3 Min", tag: "Umfrage", color: "#6C63FF" },
  { id: 2, type: "game", title: "Coin Rush – Level 5 erreichen", reward: 250, time: "10 Min", tag: "Spiel", color: "#FF6584" },
  { id: 3, type: "survey", title: "Produkttest Feedback", reward: 80, time: "2 Min", tag: "Umfrage", color: "#6C63FF" },
  { id: 4, type: "game", title: "Bubble Pop – 3 Runden", reward: 150, time: "7 Min", tag: "Spiel", color: "#FF6584" },
  { id: 5, type: "survey", title: "Lifestyle Umfrage 2025", reward: 200, time: "5 Min", tag: "Umfrage", color: "#6C63FF" },
  { id: 6, type: "game", title: "Match Master – 10 Züge", reward: 175, time: "8 Min", tag: "Spiel", color: "#FF6584" },
];

const rewards = [
  { label: "PayPal", icon: "💳", amount: "5€", coins: 1000 },
  { label: "Amazon", icon: "📦", amount: "10€", coins: 2000 },
  { label: "Steam", icon: "🎮", amount: "5€", coins: 900 },
  { label: "Crypto", icon: "₿", amount: "0.001 BTC", coins: 3000 },
];

const leaderboard = [
  { rank: 1, name: "Lisa M.", coins: 12400, badge: "🥇" },
  { rank: 2, name: "Tom K.", coins: 10850, badge: "🥈" },
  { rank: 3, name: "Hans", coins: 4820, badge: "🥉", isMe: true },
  { rank: 4, name: "Sara B.", coins: 3990, badge: "" },
  { rank: 5, name: "Max R.", coins: 3200, badge: "" },
];

const tabs = [
  { id: "Dashboard", icon: "🏠", label: "Home" },
  { id: "Aufgaben", icon: "✅", label: "Aufgaben" },
  { id: "Belohnungen", icon: "🎁", label: "Belohnungen" },
  { id: "Rangliste", icon: "🏆", label: "Rangliste" },
];

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [completedTasks, setCompletedTasks] = useState([]);
  const [coins, setCoins] = useState(user?.coins || 0);
  const [toast, setToast] = useState(null);
  const isMobile = useIsMobile();

  const completeTask = async (task) => {
    if (completedTasks.includes(task.id)) return;
    
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch("http://localhost:3001/api/auth/tasks/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ taskId: String(task.id), reward: task.reward }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setCompletedTasks(prev => [...prev, task.id]);
        setCoins(data.coins);
        showToast(`+${task.reward} Coins verdient! 🎉`);
      } else {
        showToast(data.error || "Fehler!");
      }
    } catch (err) {
      showToast("Server nicht erreichbar");
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const progress = Math.min((coins / 6000) * 100, 100);
  const streak = 5;

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "#0A0A12", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#eee", position: "relative" }}>

      {toast && <div style={S.toast}>{toast}</div>}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside style={S.sidebar}>
          <div style={S.logo}><span style={{ fontSize: 26 }}>⚡</span><span style={S.logoText}>EarnUp</span></div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ ...S.navBtn, ...(activeTab === t.id ? S.navBtnActive : {}) }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>
          <button onClick={onLogout} style={S.logoutBtn}>🚪 Abmelden</button>
          <div style={S.sidebarUser}>
            <div style={S.avatarSm}>{user?.name?.[0]?.toUpperCase() || "?"}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: "#6C63FF" }}>⚡ {coins.toLocaleString()}</div>
            </div>
          </div>
        </aside>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* Header */}
        <header style={S.header}>
          <div>
            {isMobile && <div style={S.logo}><span style={{ fontSize: 22 }}>⚡</span><span style={{ ...S.logoText, fontSize: 18 }}>EarnUp</span></div>}
            {!isMobile && <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{activeTab}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={S.streakBadge}>🔥 {streak}</div>
            <div style={S.coinBadge}>⚡ {coins.toLocaleString()}</div>
            <div style={S.avatar}>{user?.name?.[0]?.toUpperCase() || "?"}</div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 14px 80px" : "28px 28px" }}>
          {activeTab === "Dashboard" && <DashboardTab coins={coins} progress={progress} completedTasks={completedTasks} tasks={tasks} completeTask={completeTask} setActiveTab={setActiveTab} streak={streak} user={user} />}
          {activeTab === "Aufgaben" && <AufgabenTab tasks={tasks} completedTasks={completedTasks} completeTask={completeTask} />}
          {activeTab === "Belohnungen" && <BelohnungenTab rewards={rewards} coins={coins} showToast={showToast} isMobile={isMobile} />}
          {activeTab === "Rangliste" && <RanglisteTab leaderboard={leaderboard} />}
        </div>

        {/* Mobile Bottom Nav */}
        {isMobile && (
          <nav style={S.bottomNav}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ ...S.bottomBtn, ...(activeTab === t.id ? S.bottomBtnActive : {}) }}>
                <span style={{ fontSize: 22 }}>{t.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>{t.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>

      <style>{`* { box-sizing: border-box; } @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

function DashboardTab({ coins, progress, completedTasks, tasks, completeTask, setActiveTab, streak, user }) {
  return (
    <div style={{ animation: "slideUp 0.3s ease both" }}>
      <div style={S.heroCard}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Hallo, {user?.name} 👋</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>⚡ {coins.toLocaleString()}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Coins</div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
            <span>Level Fortschritt</span><span>{coins} / 6000</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 99, height: 8 }}>
            <div style={{ width: `${progress}%`, height: "100%", borderRadius: 99, background: "#fff", transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <StatCard icon="✅" label="Erledigt" value={completedTasks.length} accent="#43D9AD" />
        <StatCard icon="🔥" label="Streak" value={`${streak} Tage`} accent="#FFB347" />
      </div>

      <div style={S.section}>
        <div style={S.sectionHeader}>
          <span style={S.sectionTitle}>Schnelle Aufgaben</span>
          <button onClick={() => setActiveTab("Aufgaben")} style={S.linkBtn}>Alle →</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tasks.slice(0, 3).map(task => (
            <TaskRow key={task.id} task={task} done={completedTasks.includes(task.id)} onComplete={completeTask} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AufgabenTab({ tasks, completedTasks, completeTask }) {
  const [filter, setFilter] = useState("Alle");
  const filters = ["Alle", "Umfrage", "Spiel"];
  const filtered = filter === "Alle" ? tasks : tasks.filter(t => t.tag === filter);
  return (
    <div style={{ animation: "slideUp 0.3s ease both" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...S.chip, ...(filter === f ? S.chipActive : {}) }}>{f}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(task => (
          <TaskRow key={task.id} task={task} done={completedTasks.includes(task.id)} onComplete={completeTask} />
        ))}
      </div>
    </div>
  );
}

function BelohnungenTab({ rewards, coins, showToast, isMobile }) {
  return (
    <div style={{ animation: "slideUp 0.3s ease both" }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12 }}>
        {rewards.map(r => {
          const can = coins >= r.coins;
          return (
            <div key={r.label} style={{ ...S.rewardCard, opacity: can ? 1 : 0.55 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{r.icon}</div>
              <div style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>{r.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#43D9AD", margin: "4px 0" }}>{r.amount}</div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>⚡ {r.coins.toLocaleString()}</div>
              <button
                onClick={() => can && showToast(`${r.label} ${r.amount} eingelöst! 🎁`)}
                style={{ width: "100%", padding: "9px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 13, cursor: can ? "pointer" : "default", background: can ? "linear-gradient(135deg,#6C63FF,#FF6584)" : "#1e1e2e", color: can ? "#fff" : "#555", fontFamily: "inherit" }}
              >
                {can ? "Einlösen" : "Zu wenig"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RanglisteTab({ leaderboard }) {
  return (
    <div style={{ animation: "slideUp 0.3s ease both" }}>
      <div style={S.section}>
        <div style={S.sectionTitle}>🏆 Top diese Woche</div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {leaderboard.map(e => (
            <div key={e.rank} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: e.isMe ? "rgba(108,99,255,0.12)" : "#0D0D1A", border: `1px solid ${e.isMe ? "rgba(108,99,255,0.35)" : "#1e1e2e"}` }}>
              <span style={{ fontSize: 22, width: 30, textAlign: "center" }}>{e.badge || `#${e.rank}`}</span>
              <span style={{ flex: 1, fontWeight: 600, color: e.isMe ? "#6C63FF" : "#ddd", fontSize: 14 }}>
                {e.name} {e.isMe && <span style={{ fontSize: 10, background: "#6C63FF", borderRadius: 4, padding: "1px 5px", marginLeft: 4, color: "#fff" }}>Du</span>}
              </span>
              <span style={{ color: "#FFB347", fontWeight: 700, fontSize: 14 }}>⚡ {e.coins.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, done, onComplete }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#13131F", borderRadius: 14, padding: "14px 16px", border: "1px solid #1e1e2e", opacity: done ? 0.6 : 1 }}>
      <div style={{ fontSize: 28, flexShrink: 0 }}>{task.type === "survey" ? "📋" : "🎮"}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#eee", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</div>
        <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>⏱ {task.time} · <span style={{ color: task.color }}>{task.tag}</span></div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ color: "#FFB347", fontWeight: 800, fontSize: 14 }}>⚡{task.reward}</div>
        <button onClick={() => onComplete(task)} disabled={done} style={{ marginTop: 4, padding: "5px 14px", borderRadius: 8, border: "none", background: done ? "#1e1e2e" : "linear-gradient(135deg,#6C63FF,#FF6584)", color: done ? "#555" : "#fff", fontWeight: 700, fontSize: 12, cursor: done ? "default" : "pointer", fontFamily: "inherit" }}>
          {done ? "✓" : "Start"}
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div style={{ background: "#13131F", border: "1px solid #1e1e2e", borderRadius: 14, padding: "16px", borderTop: `3px solid ${accent}` }}>
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent, margin: "6px 0 2px" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
    </div>
  );
}

const S = {
  sidebar: { width: 210, background: "#0D0D1A", borderRight: "1px solid #1a1a2e", display: "flex", flexDirection: "column", padding: "20px 0" },
  logo: { display: "flex", alignItems: "center", gap: 8, padding: "0 20px", marginBottom: 28 },
  logoText: { fontSize: 22, fontWeight: 900, color: "#fff" },
  navBtn: { display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", margin: "0 8px", borderRadius: 10, background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "inherit" },
  navBtnActive: { background: "rgba(108,99,255,0.15)", color: "#6C63FF", fontWeight: 700 },
  logoutBtn: { display: "flex", alignItems: "center", gap: 10, padding: "10px 24px", background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: 14, fontFamily: "inherit", marginBottom: 8 },
  sidebarUser: { display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderTop: "1px solid #1a1a2e" },
  avatarSm: { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6C63FF,#FF6584)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #1a1a2e", background: "#0A0A12", position: "sticky", top: 0, zIndex: 10 },
  streakBadge: { background: "rgba(255,179,71,0.12)", border: "1px solid rgba(255,179,71,0.25)", color: "#FFB347", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  coinBadge: { background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.25)", color: "#6C63FF", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  avatar: { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6C63FF,#FF6584)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 },
  heroCard: { background: "linear-gradient(135deg,#6C63FF 0%,#FF6584 100%)", borderRadius: 18, padding: "24px 22px", marginBottom: 16 },
  section: { background: "#13131F", borderRadius: 16, padding: "18px 16px", marginBottom: 16, border: "1px solid #1e1e2e" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontWeight: 700, color: "#fff", fontSize: 15 },
  linkBtn: { background: "none", border: "none", color: "#6C63FF", cursor: "pointer", fontWeight: 700, fontSize: 13 },
  chip: { padding: "6px 16px", borderRadius: 20, border: "1px solid #1e1e2e", background: "#13131F", color: "#777", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  chipActive: { background: "rgba(108,99,255,0.15)", color: "#6C63FF", border: "1px solid rgba(108,99,255,0.3)" },
  rewardCard: { background: "#13131F", border: "1px solid #1e1e2e", borderRadius: 16, padding: "18px 14px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#0D0D1A", borderTop: "1px solid #1a1a2e", display: "flex", zIndex: 100 },
  bottomBtn: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 8px", background: "transparent", border: "none", color: "#555", cursor: "pointer", fontFamily: "inherit" },
  bottomBtnActive: { color: "#6C63FF" },
  toast: { position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "#fff", padding: "10px 24px", borderRadius: 30, fontWeight: 700, fontSize: 14, zIndex: 9999, whiteSpace: "nowrap" },
};
