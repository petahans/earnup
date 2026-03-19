import { useState } from "react";
import Dashboard from "./Dashboard";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [loggedUser, setLoggedUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const validate = () => {
    const e = {};
    if (screen === "register" && !form.name.trim()) e.name = "Name ist erforderlich";
    if (!form.email.includes("@")) e.email = "Ungültige E-Mail";
    if (form.password.length < 6) e.password = "Mindestens 6 Zeichen";
    if (screen === "register" && form.password !== form.confirm) e.confirm = "Passwörter stimmen nicht überein";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      triggerShake();
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const endpoint = screen === "login" ? "login" : "register";
      const body = screen === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, phone: form.phone };

      const res = await fetch(`https://earnup-udhe.onrender.com/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.error || "Ein Fehler ist aufgetreten" });
        triggerShake();
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setLoggedUser(data.user);
        setScreen("dashboard");
      }
    } catch {
      setErrors({ general: "Server nicht erreichbar" });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const update = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  if (screen === "dashboard") return (
    <Dashboard
      user={loggedUser}
      onLogout={() => {
        setScreen("login");
        setForm({ name: "", email: "", password: "", confirm: "", phone: "" });
        setLoggedUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }}
    />
  );

  return (
    <div style={s.root}>
      <div style={s.bg}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ ...s.particle, ...particlePos[i] }} />
        ))}
      </div>

      <div style={s.left}>
        <div style={s.brand}>
          <div style={s.brandIcon}>⚡</div>
          <div style={s.brandName}>EarnUp</div>
        </div>
        <div style={s.tagline}>Verdiene echte<br /><span style={s.taglineAccent}>Belohnungen</span><br />mit deiner Zeit.</div>
        <div style={s.features}>
          {["🎮 Spiele & gewinne Coins", "📋 Umfragen ausfüllen", "💳 Auszahlung via PayPal", "🔥 Tägliche Streaks & Boni"].map(f => (
            <div key={f} style={s.featureItem}>{f}</div>
          ))}
        </div>
        <div style={s.statsRow}>
          <div style={s.statBox}><span style={s.statNum}>48K+</span><span style={s.statLabel}>Nutzer</span></div>
          <div style={s.statBox}><span style={s.statNum}>€2M+</span><span style={s.statLabel}>Ausgezahlt</span></div>
          <div style={s.statBox}><span style={s.statNum}>4.8★</span><span style={s.statLabel}>Bewertung</span></div>
        </div>
      </div>

      <div style={s.right}>
        <div style={{ ...s.formCard, animation: shake ? "shake 0.4s ease" : "fadeUp 0.5s ease both" }}>
          <div style={s.tabs}>
            <button onClick={() => { setScreen("login"); setErrors({}); }} style={{ ...s.tab, ...(screen === "login" ? s.tabActive : {}) }}>Anmelden</button>
            <button onClick={() => { setScreen("register"); setErrors({}); }} style={{ ...s.tab, ...(screen === "register" ? s.tabActive : {}) }}>Registrieren</button>
          </div>

          <div style={s.formTitle}>{screen === "login" ? "Willkommen zurück 👋" : "Konto erstellen ✨"}</div>
          <div style={s.formSub}>{screen === "login" ? "Melde dich an und verdiene weiter." : "Tritt über 48.000 Nutzern bei."}</div>

          {errors.general && <div style={s.errorBanner}>{errors.general}</div>}

          <div style={s.fields}>
            {screen === "register" && (
              <Field label="Name" type="text" value={form.name} onChange={v => update("name", v)} error={errors.name} placeholder="Dein Name" icon="👤" />
            )}
            <Field label="E-Mail" type="email" value={form.email} onChange={v => update("email", v)} error={errors.email} placeholder="deine@email.de" icon="✉️" />
            {screen === "register" && (
              <Field label="Handynummer" type="text" value={form.phone} onChange={v => update("phone", v)} error={errors.phone} placeholder="01234567890" icon="📱" />
            )}
            <Field label="Passwort" type="password" value={form.password} onChange={v => update("password", v)} error={errors.password} placeholder="Mindestens 6 Zeichen" icon="🔒" />
            {screen === "register" && (
              <Field label="Passwort bestätigen" type="password" value={form.confirm} onChange={v => update("confirm", v)} error={errors.confirm} placeholder="Passwort wiederholen" icon="🔒" />
            )}
          </div>

          {screen === "login" && (
            <div style={{ textAlign: "right", marginTop: -8, marginBottom: 8 }}>
              <button style={s.forgotBtn}>Passwort vergessen?</button>
            </div>
          )}

          <button style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
            {loading ? "⟳ Laden..." : screen === "login" ? "Anmelden →" : "Konto erstellen →"}
          </button>

          <div style={s.divider}><span style={s.dividerLine} /><span style={s.dividerText}>oder</span><span style={s.dividerLine} /></div>

          <button style={s.googleBtn}>
            <span style={{ fontSize: 18 }}>G</span> Mit Google fortfahren
          </button>

          <div style={s.switchText}>
            {screen === "login" ? "Noch kein Konto? " : "Schon registriert? "}
            <button style={s.switchBtn} onClick={() => { setScreen(screen === "login" ? "register" : "login"); setErrors({}); }}>
              {screen === "login" ? "Registrieren" : "Anmelden"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes float { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-30px) scale(1.1)} }
      `}</style>
    </div>
  );
}

function Field({ label, type, value, onChange, error, placeholder, icon }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={s.label}>{label}</label>
      <div style={{ ...s.inputWrap, borderColor: error ? "#FF6584" : focused ? "#6C63FF" : "#1e1e2e" }}>
        <span style={s.inputIcon}>{icon}</span>
        <input
          type={isPassword && !show ? "password" : "text"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={s.input}
        />
        {isPassword && (
          <button onClick={() => setShow(!show)} style={s.eyeBtn}>{show ? "🙈" : "👁️"}</button>
        )}
      </div>
      {error && <div style={s.errorMsg}>{error}</div>}
    </div>
  );
}

function DashboardPreview({ user, onLogout }) {
  return (
    <div style={{ ...s.root, justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 24 }}>
      <div style={s.bg}>{[...Array(6)].map((_, i) => <div key={i} style={{ ...s.particle, ...particlePos[i] }} />)}</div>
      <div style={{ ...s.formCard, textAlign: "center", maxWidth: 420, animation: "fadeUp 0.5s ease both" }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Erfolgreich angemeldet!</div>
        <div style={{ color: "#888", marginBottom: 20 }}>Willkommen, <span style={{ color: "#6C63FF", fontWeight: 700 }}>{user.name}</span>!</div>
        <div style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 12, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>Angemeldet als</div>
          <div style={{ fontWeight: 700, color: "#eee" }}>{user.email}</div>
          <div style={{ fontSize: 13, color: "#43D9AD", marginTop: 8 }}>⚡ {user.coins} Coins</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ ...s.submitBtn, flex: 1 }}>Dashboard öffnen →</button>
          <button onClick={onLogout} style={{ ...s.googleBtn, flex: 1 }}>Abmelden</button>
        </div>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

const particlePos = [
  { top: "8%", left: "12%", width: 300, height: 300, animationDelay: "0s" },
  { top: "60%", left: "5%", width: 200, height: 200, animationDelay: "1s" },
  { top: "20%", left: "50%", width: 150, height: 150, animationDelay: "2s" },
  { top: "70%", left: "40%", width: 250, height: 250, animationDelay: "0.5s" },
  { top: "5%", right: "10%", width: 180, height: 180, animationDelay: "1.5s" },
  { bottom: "5%", right: "5%", width: 220, height: 220, animationDelay: "0.8s" },
];

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#0A0A12", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#eee", position: "relative", overflow: "hidden" },
  bg: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 },
  particle: { position: "absolute", borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)", animation: "float 8s ease-in-out infinite" },
  left: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 64px", position: "relative", zIndex: 1, borderRight: "1px solid #1a1a2e" },
  brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 48 },
  brandIcon: { fontSize: 36 },
  brandName: { fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: -1 },
  tagline: { fontSize: 42, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 36, letterSpacing: -1 },
  taglineAccent: { background: "linear-gradient(135deg,#6C63FF,#FF6584)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  features: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 48 },
  featureItem: { color: "#aaa", fontSize: 15, display: "flex", alignItems: "center", gap: 8 },
  statsRow: { display: "flex", gap: 24 },
  statBox: { display: "flex", flexDirection: "column" },
  statNum: { fontSize: 22, fontWeight: 800, color: "#fff" },
  statLabel: { fontSize: 12, color: "#555" },
  right: { width: 480, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, position: "relative", zIndex: 1 },
  formCard: { background: "#13131F", borderRadius: 20, padding: 36, width: "100%", border: "1px solid #1e1e2e", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" },
  tabs: { display: "flex", background: "#0A0A12", borderRadius: 10, padding: 4, marginBottom: 28 },
  tab: { flex: 1, padding: "8px", borderRadius: 8, border: "none", background: "transparent", color: "#666", fontWeight: 600, cursor: "pointer", fontSize: 14, transition: "all 0.2s" },
  tabActive: { background: "#1e1e2e", color: "#fff" },
  formTitle: { fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 },
  formSub: { fontSize: 13, color: "#666", marginBottom: 24 },
  errorBanner: { background: "rgba(255,101,132,0.12)", border: "1px solid rgba(255,101,132,0.3)", borderRadius: 10, padding: "10px 14px", color: "#FF6584", fontSize: 13, marginBottom: 16 },
  fields: {},
  label: { display: "block", fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrap: { display: "flex", alignItems: "center", background: "#0A0A12", border: "1.5px solid #1e1e2e", borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s" },
  inputIcon: { padding: "0 12px", fontSize: 16 },
  input: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#eee", fontSize: 14, padding: "12px 0", fontFamily: "inherit" },
  eyeBtn: { background: "none", border: "none", cursor: "pointer", padding: "0 12px", fontSize: 16 },
  errorMsg: { color: "#FF6584", fontSize: 12, marginTop: 4 },
  forgotBtn: { background: "none", border: "none", color: "#6C63FF", cursor: "pointer", fontSize: 12, fontWeight: 600 },
  submitBtn: { width: "100%", padding: "13px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 4, fontFamily: "inherit" },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "20px 0" },
  dividerLine: { flex: 1, height: 1, background: "#1e1e2e" },
  dividerText: { color: "#555", fontSize: 12 },
  googleBtn: { width: "100%", padding: "12px", background: "#1a1a2e", border: "1px solid #1e1e2e", borderRadius: 12, color: "#ccc", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit" },
  switchText: { textAlign: "center", fontSize: 13, color: "#666", marginTop: 20 },
  switchBtn: { background: "none", border: "none", color: "#6C63FF", fontWeight: 700, cursor: "pointer", fontSize: 13 },
};
