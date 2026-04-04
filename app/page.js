"use client";
import { supabase } from "../lib/supabase";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

const COLORS = {
  navy: "#0A1628",
  navyMid: "#142240",
  navyLight: "#1E3366",
  red: "#C8102E",
  redLight: "#E8193A",
  gold: "#E8B84B",
  white: "#FFFFFF",
  gray50: "#F8F9FB",
  gray100: "#EEF0F5",
  gray200: "#DDE1EA",
  gray400: "#9BA4B5",
  gray600: "#5A6478",
  gray800: "#2D3345",
  success: "#1A7A4A",
  successBg: "#E8F5EE",
  warning: "#B85C00",
  warningBg: "#FFF4E6",
  info: "#185FA5",
  infoBg: "#E6F1FB",
};

const DEPARTMENTS = [
  "Computer Engineering",
  "Software Engineering",
  "Artificial Intelligence Engineering",
  "Electrical & Electronics Engineering",
  "Industrial Engineering",
  "Civil Engineering",
  "Architecture",
  "Interior Architecture",
  "Environmental Design",
  "Business Administration",
  "International Trade",
  "Economics",
  "Finance",
  "Management Information Systems",
  "Marketing",
  "Entrepreneurship",
  "Law",
  "Medicine",
  "Dentistry",
  "Pharmacy",
  "Nursing",
  "Physiotherapy & Rehabilitation",
  "Nutrition and Dietetics",
  "Psychology",
  "Sociology",
  "Political Science & International Relations",
  "Communication",
  "Public Relations & Advertising",
  "Journalism",
  "New Media",
  "Cinema & Television",
  "Graphic Design",
  "Game Design",
  "English Language Teaching",
  "Turkish Language & Literature",
  "Translation & Interpreting",
  "Mathematics",
  "Software Development",
  "Data Science",
];

function getInitials(name) {
  return name
    .split(" ")
    .filter((w) => /^[A-ZÇĞİÖŞÜ]/.test(w))
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getAvatarColor(name) {
  const colors = [
    { bg: "#1E3366", text: "#E8B84B" },
    { bg: "#C8102E", text: "#FFFFFF" },
    { bg: "#142240", text: "#9BA4B5" },
    { bg: "#2D3345", text: "#E8B84B" },
    { bg: "#0A1628", text: "#DDE1EA" },
  ];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % colors.length;
  return colors[hash];
}

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildProfessorStats(reviews) {
  const stats = {};
  for (const review of reviews) {
    const pid = review.professorId;
    if (!stats[pid]) stats[pid] = { count: 0, total: 0 };
    stats[pid].count += 1;
    stats[pid].total += Number(review.rating || 0);
  }
  return stats;
}

function mergeProfessorStats(professors, reviews) {
  const stats = buildProfessorStats(reviews);
  return professors.map((prof) => {
    const s = stats[prof.id];
    if (!s) {
      return {
        ...prof,
        avgRating: Number(prof.avgRating || 0),
        totalReviews: Number(prof.totalReviews || 0),
      };
    }
    return {
      ...prof,
      avgRating: Number((s.total / s.count).toFixed(1)),
      totalReviews: s.count,
    };
  });
}

function StarRating({ value, max = 5, size = 16, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < (interactive ? hover || value : value);
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? COLORS.gold : COLORS.gray200}
            style={{ cursor: interactive ? "pointer" : "default", transition: "fill 0.15s" }}
            onMouseEnter={interactive ? () => setHover(i + 1) : undefined}
            onMouseLeave={interactive ? () => setHover(0) : undefined}
            onClick={interactive ? () => onChange(i + 1) : undefined}
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        );
      })}
    </div>
  );
}

function RatingBar({ label, value, max = 5 }) {
  const pct = (value / max) * 100;
  const color = value >= 4 ? COLORS.success : value >= 3 ? COLORS.warning : COLORS.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: COLORS.gray600, minWidth: 110 }}>{label}</span>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: COLORS.gray100, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: color, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray800, minWidth: 28 }}>{value.toFixed(1)}</span>
    </div>
  );
}

function Badge({ status }) {
  const config = {
    pending: { bg: COLORS.warningBg, color: COLORS.warning, label: "Pending" },
    added: { bg: COLORS.successBg, color: COLORS.success, label: "Added" },
    duplicate: { bg: COLORS.gray100, color: COLORS.gray600, label: "Duplicate" },
  };
  const { bg, color, label } = config[status] || config.pending;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: bg, color, letterSpacing: "0.03em", textTransform: "uppercase" }}>
      {label}
    </span>
  );
}

function AdPlaceholder() {
  return null;
}

function ProfessorCard({ professor, onClick }) {
  const initials = getInitials(professor.name);
  const avatarColor = getAvatarColor(professor.name);
  const liveAvgRating = Number(professor.avgRating || 0);
  const liveTotalReviews = Number(professor.totalReviews || 0);
  const ratingColor =
    liveAvgRating >= 4.5
      ? COLORS.success
      : liveAvgRating >= 3.5
      ? COLORS.warning
      : COLORS.red;

  const [imgError, setImgError] = useState(false);
  const hasImage = professor.image_url && !imgError;

  return (
    <div
      onClick={onClick}
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.gray100}`,
        borderRadius: 18,
        padding: 18,
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = COLORS.navyLight;
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(10,22,40,0.10)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.gray100;
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        {hasImage ? (
          <img
            src={professor.image_url}
            alt={professor.name}
            onError={() => setImgError(true)}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${COLORS.gray100}`,
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: avatarColor.bg,
              color: avatarColor.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: COLORS.navy,
              marginBottom: 4,
            }}
          >
            {professor.name}
          </div>

          <div
            style={{
              fontSize: 13,
              color: COLORS.gray600,
            }}
          >
            {professor.department}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "#f8fafc",
          borderRadius: 999,
          padding: "6px 10px",
          marginBottom: 12,
          color: ratingColor,
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        <span>{liveAvgRating.toFixed(1)}</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {(professor.tags || []).map((tag) => (
          <span
            key={tag}
            style={{
              background: COLORS.gray50,
              color: COLORS.gray600,
              padding: "6px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <div style={{ fontSize: 13, color: COLORS.gray600, marginBottom: 10 }}>
        {liveTotalReviews} reviews
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {(professor.courses || []).slice(0, 2).map((c) => (
          <span
            key={c}
            style={{
              background: COLORS.infoBg,
              color: COLORS.info,
              padding: "6px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function Header({ page, setPage }) {
  const navItems = [
    { id: "home", label: "Home" },
    { id: "professors", label: "Professors" },
    { id: "suggestions", label: "Suggestions" },
  ];

  return (
    <header style={{ background: COLORS.navy, position: "sticky", top: 0, zIndex: 100, borderBottom: `2px solid ${COLORS.red}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/bau-logo.png" alt="BAU Logo" style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 6 }} />
          <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: COLORS.white, letterSpacing: "-0.01em" }}>
            Rate My <span style={{ color: COLORS.gold }}>BAU</span>
          </span>
        </div>

        <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                background: page === item.id ? COLORS.red : "transparent",
                border: "none",
                color: page === item.id ? COLORS.white : COLORS.gray400,
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.15s",
                fontFamily: "inherit",
              }}
            >
              {item.label}
            </button>
          ))}

          <button onClick={() => setPage("suggestions")} style={{ background: COLORS.gold, border: "none", color: COLORS.navy, padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, marginLeft: 0, fontFamily: "inherit" }}>
            + Suggest
          </button>
        </nav>
      </div>
    </header>
  );
}

function HomePage({ professors, reviews, setPage, setSelectedProfessor }) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const topRated = [...professors].sort((a, b) => b.avgRating - a.avgRating).slice(0, 4);
  const mostReviewed = [...professors].sort((a, b) => b.totalReviews - a.totalReviews).slice(0, 4);

  const handleSearch = (val) => {
    setSearch(val);
    if (val.length > 1) {
      setSuggestions(
        professors
          .filter(
            (p) =>
              p.name.toLowerCase().includes(val.toLowerCase()) ||
              p.department.toLowerCase().includes(val.toLowerCase())
          )
          .slice(0, 5)
      );
    } else {
      setSuggestions([]);
    }
  };

  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);

  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 60%, ${COLORS.navyLight} 100%)`, padding: "64px 20px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.04, backgroundImage: "radial-gradient(circle at 20% 50%, #E8B84B 0%, transparent 50%), radial-gradient(circle at 80% 20%, #C8102E 0%, transparent 50%)" }} />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: COLORS.red, color: COLORS.white, fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 20, letterSpacing: "0.08em" }}>BAHÇEŞEHIR UNIVERSITY</div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(32px, 6vw, 54px)", color: COLORS.white, margin: "0 0 16px", lineHeight: 1.15, fontWeight: 700 }}>
            Find the <span style={{ color: COLORS.gold }}>best professors</span> at BAU
          </h1>
          <p style={{ color: COLORS.gray400, fontSize: 16, marginBottom: 36, lineHeight: 1.6 }}>
            Honest, anonymous student reviews. Rate your professors and help your fellow students make better choices.
          </p>
          <div style={{ position: "relative", maxWidth: 520, margin: "0 auto" }}>
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by professor name or department..."
              style={{ width: "100%", padding: "14px 20px 14px 48px", fontSize: 15, borderRadius: 14, border: "none", outline: "none", boxSizing: "border-box", background: COLORS.white, color: COLORS.navy, fontFamily: "inherit" }}
            />
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
            {suggestions.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: COLORS.white, borderRadius: 12, boxShadow: "0 12px 40px rgba(10,22,40,0.18)", zIndex: 50, overflow: "hidden" }}>
                {suggestions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProfessor(p);
                      setPage("professor");
                      setSuggestions([]);
                      setSearch("");
                    }}
                    style={{ padding: "12px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${COLORS.gray100}` }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.navy }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.red }}>{p.department}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>{Number(p.avgRating || 0).toFixed(1)}</span>
                      <StarRating value={Math.round(Number(p.avgRating || 0))} size={11} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 28, flexWrap: "wrap" }}>
            <button onClick={() => setPage("professors")} style={{ background: COLORS.red, color: COLORS.white, border: "none", padding: "10px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              Browse All Professors
            </button>
            <button onClick={() => setPage("suggestions")} style={{ background: "transparent", color: COLORS.gold, border: `1.5px solid ${COLORS.gold}`, padding: "10px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              + Suggest a Professor
            </button>
          </div>
        </div>
      </div>

      <AdPlaceholder />

      <div style={{ background: COLORS.navy, padding: "20px", display: "flex", justifyContent: "center", gap: "clamp(24px, 6vw, 64px)", flexWrap: "wrap" }}>
        {[
          { value: professors.length + "+", label: "Professors" },
          { value: reviews.length + "+", label: "Reviews" },
          { value: DEPARTMENTS.length + "+", label: "Departments" },
          { value: "100%", label: "Anonymous" },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: COLORS.gold, fontFamily: "'DM Serif Display', Georgia, serif" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: COLORS.gray400, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, color: COLORS.navy, margin: 0 }}>⭐ Top Rated Professors</h2>
            <button onClick={() => setPage("professors")} style={{ background: "none", border: "none", color: COLORS.red, cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit" }}>View all →</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {topRated.map((p) => (
              <ProfessorCard key={p.id} professor={p} onClick={() => { setSelectedProfessor(p); setPage("professor"); }} />
            ))}
          </div>
        </div>

        <AdPlaceholder />

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, color: COLORS.navy, margin: 0 }}>💬 Most Reviewed</h2>
            <button onClick={() => setPage("professors")} style={{ background: "none", border: "none", color: COLORS.red, cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit" }}>View all →</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {mostReviewed.map((p) => (
              <ProfessorCard key={p.id} professor={p} onClick={() => { setSelectedProfessor(p); setPage("professor"); }} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, color: COLORS.navy, marginBottom: 20 }}>🕒 Recent Reviews</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentReviews.map((r) => {
              const prof = professors.find((p) => p.id === r.professorId);
              return (
                <div key={r.id} style={{ background: COLORS.white, borderRadius: 14, padding: "16px 20px", border: `1px solid ${COLORS.gray100}`, cursor: "pointer" }} onClick={() => { setSelectedProfessor(prof); setPage("professor"); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.navy, marginBottom: 2 }}>{prof?.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.red, marginBottom: 8 }}>{prof?.department}</div>
                      <p style={{ fontSize: 14, color: COLORS.gray600, margin: 0, lineHeight: 1.5 }}>
                        "{r.comment.slice(0, 120)}..."
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <StarRating value={r.rating} size={13} />
                      <span style={{ fontSize: 11, color: COLORS.gray400 }}>{timeAgo(r.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: COLORS.infoBg, border: `1px solid ${COLORS.info}33`, borderRadius: 12, padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.info, lineHeight: 1.6 }}>
            <strong>Disclaimer:</strong> All reviews on Rate My BAU are anonymous student opinions and do not represent the official views of Bahçeşehir University. Reviews are intended for informational and educational purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfessorsPage({ professors, setPage, setSelectedProfessor }) {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [sort, setSort] = useState("top_rated");

  const filtered = useMemo(() => {
    let list = professors.filter((p) => {
      const q = search.toLowerCase();
      return (
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          (p.courses || []).some((c) => c.toLowerCase().includes(q))) &&
        (!dept || p.department === dept)
      );
    });

    if (sort === "top_rated") list = [...list].sort((a, b) => b.avgRating - a.avgRating);
    else if (sort === "most_reviewed") list = [...list].sort((a, b) => b.totalReviews - a.totalReviews);
    else if (sort === "newest") list = [...list].sort((a, b) => b.id - a.id);

    return list;
  }, [professors, search, dept, sort]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
      <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 32, color: COLORS.navy, marginBottom: 8 }}>All Professors</h1>
      <p style={{ color: COLORS.gray600, marginBottom: 28, fontSize: 15 }}>{professors.length} professors across {DEPARTMENTS.length} departments</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search professor, department, or course..." style={{ width: "100%", padding: "10px 16px 10px 40px", borderRadius: 10, border: `1.5px solid ${COLORS.gray200}`, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: COLORS.navy }} />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
        </div>
        <select value={dept} onChange={(e) => setDept(e.target.value)} style={{ padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.gray200}`, fontSize: 14, color: COLORS.navy, background: COLORS.white, fontFamily: "inherit", cursor: "pointer", flex: "1 1 160px" }}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.gray200}`, fontSize: 14, color: COLORS.navy, background: COLORS.white, fontFamily: "inherit", cursor: "pointer", flex: "1 1 140px" }}>
          <option value="top_rated">Top Rated</option>
          <option value="most_reviewed">Most Reviewed</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <AdPlaceholder />

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.gray400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.gray600, marginBottom: 8 }}>No professors found</div>
          <div style={{ fontSize: 14 }}>Try a different search or filter</div>
          <button onClick={() => setPage("suggestions")} style={{ marginTop: 20, background: COLORS.red, color: COLORS.white, border: "none", padding: "10px 24px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>
            Suggest a Professor
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map((p) => (
            <ProfessorCard key={p.id} professor={p} onClick={() => { setSelectedProfessor(p); setPage("professor"); }} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewForm({ professor, onSubmit, alreadyReviewed }) {
  const [form, setForm] = useState({ rating: 0, teachingQuality: 0, clarity: 0, fairness: 0, difficulty: 3, wouldTakeAgain: null, course: "", semester: "", comment: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.rating) e.rating = "Please select an overall rating";
    if (!form.comment || form.comment.length < 20) e.comment = "Please write at least 20 characters";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    await onSubmit({ ...form, professorId: professor.id, timestamp: new Date().toISOString() });
    setSubmitted(true);
  };

  if (alreadyReviewed) {
    return (
      <div style={{ background: COLORS.warningBg, border: `1px solid ${COLORS.warning}44`, borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 20, marginBottom: 8 }}>✋</div>
        <div style={{ fontWeight: 600, color: COLORS.warning, marginBottom: 4 }}>You've already reviewed this professor</div>
        <div style={{ fontSize: 13, color: COLORS.gray600 }}>One review per professor per device to keep things fair.</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ background: COLORS.successBg, border: `1px solid ${COLORS.success}44`, borderRadius: 12, padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
        <div style={{ fontWeight: 700, color: COLORS.success, fontSize: 16, marginBottom: 4 }}>Review submitted!</div>
        <div style={{ fontSize: 13, color: COLORS.gray600 }}>Your anonymous review is now live.</div>
      </div>
    );
  }

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div style={{ background: COLORS.white, borderRadius: 16, border: `1.5px solid ${COLORS.gray100}`, padding: "24px" }}>
      <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.navy, margin: "0 0 20px" }}>Write a Review</h3>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 6 }}>Overall Rating *</label>
        <StarRating value={form.rating} size={28} interactive onChange={(v) => set("rating", v)} />
        {errors.rating && <div style={{ color: COLORS.red, fontSize: 12, marginTop: 4 }}>{errors.rating}</div>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[ ["teachingQuality", "Teaching Quality"], ["clarity", "Clarity"], ["fairness", "Fairness"] ].map(([key, label]) => (
          <div key={key}>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 6 }}>{label}</label>
            <StarRating value={form[key]} size={18} interactive onChange={(v) => set(key, v)} />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 6 }}>Difficulty: {form.difficulty}/5</label>
        <input type="range" min={1} max={5} step={1} value={form.difficulty} onChange={(e) => set("difficulty", +e.target.value)} style={{ width: "100%", accentColor: COLORS.navy }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 8 }}>Would you take this professor again?</label>
        <div style={{ display: "flex", gap: 10 }}>
          {[true, false].map((v) => (
            <button key={String(v)} onClick={() => set("wouldTakeAgain", v)} style={{ padding: "8px 20px", borderRadius: 8, border: `1.5px solid ${form.wouldTakeAgain === v ? (v ? COLORS.success : COLORS.red) : COLORS.gray200}`, background: form.wouldTakeAgain === v ? (v ? COLORS.successBg : "#fef2f2") : COLORS.white, color: form.wouldTakeAgain === v ? (v ? COLORS.success : COLORS.red) : COLORS.gray600, cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit" }}>
              {v ? "👍 Yes" : "👎 No"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 6 }}>Course (optional)</label>
          <input value={form.course} onChange={(e) => set("course", e.target.value)} placeholder="e.g. Data Structures" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.gray200}`, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: COLORS.navy }} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 6 }}>Semester (optional)</label>
          <input value={form.semester} onChange={(e) => set("semester", e.target.value)} placeholder="e.g. Spring 2025" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.gray200}`, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: COLORS.navy }} />
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 6 }}>Your Review *</label>
        <textarea value={form.comment} onChange={(e) => set("comment", e.target.value)} rows={4} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.gray200}`, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", color: COLORS.navy, boxSizing: "border-box" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {errors.comment && <span style={{ color: COLORS.red, fontSize: 12 }}>{errors.comment}</span>}
          <span style={{ fontSize: 12, color: COLORS.gray400, marginLeft: "auto" }}>{form.comment.length} chars</span>
        </div>
      </div>
      <div style={{ background: COLORS.gray50, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: COLORS.gray600 }}>
        🔒 Your review is 100% anonymous. No personal information is collected or stored.
      </div>
      <button onClick={handleSubmit} style={{ width: "100%", background: COLORS.navy, color: COLORS.white, border: "none", padding: "13px", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
        Submit Anonymous Review
      </button>
    </div>
  );
}

function ProfessorPage({ professor, professors, reviews, setSelectedProfessor, setPage, onAddReview }) {
  const profReviews = reviews
    .filter((r) => r.professorId === professor.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const [reported, setReported] = useState({});
  const [imgError, setImgError] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const reviewedKey = `ratemybau_reviewed_${professor.id}`;
      setAlreadyReviewed(localStorage.getItem(reviewedKey) === "1");
    }
  }, [professor.id]);

  const liveAvgRating = profReviews.length
    ? Number((profReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / profReviews.length).toFixed(1))
    : Number(professor.avgRating || 0);

  const liveTotalReviews = profReviews.length || Number(professor.totalReviews || 0);
  const avgTeaching = profReviews.length ? profReviews.reduce((s, r) => s + (r.teachingQuality || r.rating), 0) / profReviews.length : liveAvgRating;
  const avgClarity = profReviews.length ? profReviews.reduce((s, r) => s + (r.clarity || r.rating), 0) / profReviews.length : liveAvgRating;
  const avgFairness = profReviews.length ? profReviews.reduce((s, r) => s + (r.fairness || r.rating), 0) / profReviews.length : liveAvgRating;
  const wouldTakeAgainPct = profReviews.length ? Math.round((profReviews.filter((r) => r.wouldTakeAgain).length / profReviews.length) * 100) : 0;

  const initials = getInitials(professor.name);
  const avatarColor = getAvatarColor(professor.name);
  const ratingColor = liveAvgRating >= 4.5 ? COLORS.success : liveAvgRating >= 3.5 ? COLORS.warning : COLORS.red;

  const handleAddReview = async (newReview) => {
    await onAddReview(newReview);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ratemybau_reviewed_${professor.id}`, "1");
      setAlreadyReviewed(true);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>
      <button onClick={() => setPage("professors")} style={{ background: "none", border: "none", color: COLORS.red, cursor: "pointer", fontWeight: 600, fontSize: 14, marginBottom: 24, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
        ← Back to Professors
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, alignItems: "start" }}>
        <div>
          <div style={{ background: COLORS.white, borderRadius: 20, padding: "28px", border: `1.5px solid ${COLORS.gray100}`, marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, overflow: "hidden", background: avatarColor.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {!imgError && professor.image ? (
                  <img src={professor.image} alt={professor.name} onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ fontWeight: 800, fontSize: 28, color: avatarColor.text, fontFamily: "'DM Serif Display', Georgia, serif" }}>{initials}</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(20px, 4vw, 28px)", color: COLORS.navy, margin: "0 0 6px" }}>{professor.name}</h1>
                <div style={{ fontSize: 14, color: COLORS.red, fontWeight: 700, marginBottom: 12 }}>{professor.department}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(professor.courses || []).map((c) => (
                    <span key={c} style={{ fontSize: 12, color: COLORS.navyLight, background: COLORS.gray50, border: `1px solid ${COLORS.gray200}`, borderRadius: 6, padding: "3px 10px" }}>{c}</span>
                  ))}
                </div>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  {professor.title && <div style={{ fontSize: 13, color: COLORS.gray600 }}><strong>Title:</strong> {professor.title}</div>}
                  {professor.faculty && <div style={{ fontSize: 13, color: COLORS.gray600 }}><strong>Faculty:</strong> {professor.faculty}</div>}
                  {professor.email && <div style={{ fontSize: 13, color: COLORS.gray600 }}><strong>Email:</strong> <a href={`mailto:${professor.email}`} style={{ color: COLORS.red, textDecoration: "none" }}>{professor.email}</a></div>}
                  {professor.profileUrl && <div style={{ fontSize: 13, color: COLORS.gray600 }}><strong>Profile:</strong> <a href={professor.profileUrl} target="_blank" rel="noreferrer" style={{ color: COLORS.red, textDecoration: "none" }}>Official profile</a></div>}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: ratingColor, fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1 }}>{liveAvgRating.toFixed(1)}</div>
                <StarRating value={Math.round(liveAvgRating)} size={18} />
                <div style={{ fontSize: 12, color: COLORS.gray400, marginTop: 4 }}>{liveTotalReviews} reviews</div>
              </div>
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${COLORS.gray100}` }}>
              <RatingBar label="Teaching Quality" value={avgTeaching} />
              <RatingBar label="Clarity" value={avgClarity} />
              <RatingBar label="Fairness" value={avgFairness} />
            </div>
            {profReviews.length > 0 && (
              <div style={{ marginTop: 16, display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: wouldTakeAgainPct >= 70 ? COLORS.success : COLORS.warning }}>{wouldTakeAgainPct}%</div>
                  <div style={{ fontSize: 12, color: COLORS.gray600 }}>Would Take Again</div>
                </div>
                {(professor.tags || []).map((tag) => (
                  <span key={tag} style={{ fontSize: 12, background: COLORS.navy, color: COLORS.gold, borderRadius: 20, padding: "4px 14px", alignSelf: "center" }}>{tag}</span>
                ))}
              </div>
            )}
          </div>

          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: COLORS.navy, marginBottom: 16 }}>Student Reviews ({profReviews.length})</h2>

          {profReviews.length === 0 ? (
            <div style={{ background: COLORS.gray50, borderRadius: 16, padding: "40px", textAlign: "center", color: COLORS.gray400, marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <div style={{ fontWeight: 600, color: COLORS.gray600, fontSize: 16 }}>No reviews yet</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>Be the first to review this professor!</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              {profReviews.map((r) => (
                <div key={r.id} style={{ background: COLORS.white, borderRadius: 14, padding: "20px", border: `1px solid ${COLORS.gray100}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <StarRating value={r.rating} size={15} />
                        <span style={{ fontWeight: 700, color: COLORS.navy, fontSize: 15 }}>{r.rating}/5</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {r.course && <span style={{ fontSize: 12, color: COLORS.gray600, background: COLORS.gray50, borderRadius: 4, padding: "2px 8px" }}>{r.course}</span>}
                        {r.semester && <span style={{ fontSize: 12, color: COLORS.gray600, background: COLORS.gray50, borderRadius: 4, padding: "2px 8px" }}>{r.semester}</span>}
                        {r.wouldTakeAgain !== undefined && r.wouldTakeAgain !== null && <span style={{ fontSize: 12, borderRadius: 4, padding: "2px 8px", background: r.wouldTakeAgain ? COLORS.successBg : "#fef2f2", color: r.wouldTakeAgain ? COLORS.success : COLORS.red }}>{r.wouldTakeAgain ? "✓ Would take again" : "✗ Would not take again"}</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: COLORS.gray400, flexShrink: 0 }}>{timeAgo(r.timestamp)}</span>
                  </div>
                  <p style={{ margin: "0 0 12px", fontSize: 14, color: COLORS.gray800, lineHeight: 1.6 }}>{r.comment}</p>
                  <button onClick={() => setReported((p) => ({ ...p, [r.id]: true }))} style={{ background: "none", border: "none", color: COLORS.gray400, cursor: "pointer", fontSize: 12, fontFamily: "inherit", padding: 0 }}>
                    {reported[r.id] ? "✓ Reported" : "⚑ Report"}
                  </button>
                </div>
              ))}
            </div>
          )}

          <ReviewForm professor={professor} onSubmit={handleAddReview} alreadyReviewed={alreadyReviewed} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <AdPlaceholder />
          <div style={{ background: COLORS.navy, borderRadius: 16, padding: "20px" }}>
            <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 16, color: COLORS.gold, margin: "0 0 12px" }}>Other Professors</h3>
            {professors.filter((p) => p.department === professor.department && p.id !== professor.id).slice(0, 3).map((p) => (
              <div key={p.id} style={{ padding: "10px 0", borderBottom: `1px solid ${COLORS.navyLight}`, cursor: "pointer" }} onClick={() => { setSelectedProfessor(p); setPage("professor"); window.scrollTo(0, 0); }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.white }}>{p.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  <StarRating value={Math.round(Number(p.avgRating || 0))} size={11} />
                  <span style={{ fontSize: 12, color: COLORS.gold }}>{Number(p.avgRating || 0).toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: COLORS.gray50, border: `1.5px solid ${COLORS.gray200}`, borderRadius: 16, padding: "20px" }}>
            <p style={{ fontSize: 13, color: COLORS.gray600, lineHeight: 1.6, margin: "0 0 12px" }}>All reviews are anonymous student opinions and do not represent BAU's official position.</p>
            <a href="#guidelines" style={{ fontSize: 13, color: COLORS.red, fontWeight: 600, textDecoration: "none" }}>Community Guidelines →</a>
          </div>
          <AdPlaceholder />
        </div>
      </div>
    </div>
  );
}

function SuggestionsPage({ suggestions, onAddSuggestion }) {
  const [form, setForm] = useState({ name: "", department: "", course: "", note: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [supported, setSupported] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Professor name is required";
    if (!form.department) e.department = "Department is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    const dupeKey = `ratemybau_suggest_${form.name.toLowerCase().replace(/\s/g, "_")}`;
    if (typeof window !== "undefined" && localStorage.getItem(dupeKey)) {
      setErrors({ name: "You've already suggested this professor from this device." });
      return;
    }

    await onAddSuggestion({ ...form, status: "pending", timestamp: new Date().toISOString(), supportCount: 0 });
    if (typeof window !== "undefined") localStorage.setItem(dupeKey, "1");
    setSubmitted(true);
    setForm({ name: "", department: "", course: "", note: "" });
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
    }, 3000);
  };

  const handleSupport = (id) => {
    const key = `ratemybau_support_${id}`;
    if (typeof window !== "undefined" && localStorage.getItem(key)) return;
    setSupported((p) => ({ ...p, [id]: true }));
    if (typeof window !== "undefined") localStorage.setItem(key, "1");
  };

  const filtered = suggestions.filter((s) => {
    const q = search.toLowerCase();
    return ((!q || s.name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q)) && (!statusFilter || s.status === statusFilter));
  });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 32, color: COLORS.navy, margin: "0 0 8px" }}>Professor Suggestions</h1>
          <p style={{ color: COLORS.gray600, margin: 0, fontSize: 15 }}>Can't find your professor? Suggest them and help the community!</p>
        </div>
        <button onClick={() => setShowForm((f) => !f)} style={{ background: COLORS.red, color: COLORS.white, border: "none", padding: "11px 22px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
          {showForm ? "✕ Close" : "+ Suggest a Professor"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: COLORS.white, borderRadius: 16, border: `1.5px solid ${COLORS.navyLight}`, padding: "24px", marginBottom: 28 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: COLORS.navy, margin: "0 0 20px" }}>Suggest a New Professor</h3>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <div style={{ fontWeight: 700, color: COLORS.success, fontSize: 16 }}>Suggestion submitted!</div>
              <div style={{ fontSize: 13, color: COLORS.gray600, marginTop: 4 }}>Your suggestion is now visible to all students.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 6 }}>Professor Name *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Dr. Ahmet Yılmaz" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${errors.name ? COLORS.red : COLORS.gray200}`, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: COLORS.navy }} />
                  {errors.name && <div style={{ color: COLORS.red, fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 6 }}>Department *</label>
                  <select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${errors.department ? COLORS.red : COLORS.gray200}`, fontSize: 14, background: COLORS.white, color: COLORS.navy, fontFamily: "inherit", cursor: "pointer" }}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <div style={{ color: COLORS.red, fontSize: 12, marginTop: 4 }}>{errors.department}</div>}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 6 }}>Course (optional)</label>
                <input value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))} placeholder="e.g. Introduction to Programming" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.gray200}`, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: COLORS.navy }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 6 }}>Note (optional)</label>
                <textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.gray200}`, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", color: COLORS.navy, boxSizing: "border-box" }} />
              </div>
              <div style={{ background: COLORS.gray50, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: COLORS.gray600 }}>🔒 Suggestions are completely anonymous.</div>
              <button onClick={handleSubmit} style={{ background: COLORS.navy, color: COLORS.white, border: "none", padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>Submit Suggestion</button>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search suggestions..." style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: 10, border: `1.5px solid ${COLORS.gray200}`, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: COLORS.navy }} />
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.gray200}`, fontSize: 14, color: COLORS.navy, background: COLORS.white, fontFamily: "inherit", cursor: "pointer" }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="added">Added</option>
          <option value="duplicate">Duplicate</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.gray400 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 600, color: COLORS.gray600, fontSize: 16 }}>No suggestions found</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((s) => {
            const hasSupported = typeof window !== "undefined" && localStorage.getItem(`ratemybau_support_${s.id}`);
            const count = s.supportCount + (supported[s.id] ? 1 : 0);
            return (
              <div key={s.id} style={{ background: COLORS.white, borderRadius: 16, padding: "20px 22px", border: `1.5px solid ${COLORS.gray100}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 700, fontSize: 17, color: COLORS.navy }}>{s.name}</span>
                      <Badge status={s.status} />
                    </div>
                    <div style={{ fontSize: 13, color: COLORS.red, fontWeight: 600, marginBottom: 6 }}>{s.department}</div>
                    {s.course && <div style={{ fontSize: 13, color: COLORS.gray600, marginBottom: 6 }}>📚 {s.course}</div>}
                    {s.note && <p style={{ fontSize: 14, color: COLORS.gray600, margin: "6px 0 0", lineHeight: 1.5 }}>&quot;{s.note}&quot;</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => handleSupport(s.id)} disabled={hasSupported || supported[s.id]} style={{ background: hasSupported || supported[s.id] ? COLORS.successBg : COLORS.gray50, border: `1.5px solid ${hasSupported || supported[s.id] ? COLORS.success : COLORS.gray200}`, color: hasSupported || supported[s.id] ? COLORS.success : COLORS.gray600, borderRadius: 10, padding: "8px 14px", cursor: hasSupported || supported[s.id] ? "default" : "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", textAlign: "center" }}>
                      <div style={{ fontSize: 18 }}>👍</div>
                      <div>{count}</div>
                    </button>
                    <span style={{ fontSize: 11, color: COLORS.gray400 }}>{timeAgo(s.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AdPlaceholder />

      <div style={{ background: COLORS.navy, borderRadius: 16, padding: "24px", marginTop: 32, color: COLORS.white }}>
        <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: COLORS.gold, fontSize: 18, margin: "0 0 14px" }}>Community Guidelines</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 2, color: COLORS.gray400 }}>
          <li>Be respectful and constructive in your reviews</li>
          <li>Focus on academic experience, not personal attributes</li>
          <li>Avoid defamatory or harassing language</li>
          <li>One review per professor — keep it fair</li>
          <li>Reviews may be removed if they violate these guidelines</li>
        </ul>
      </div>
    </div>
  );
}

function Footer({ setPage }) {
  return (
    <footer style={{ background: COLORS.navy, borderTop: `2px solid ${COLORS.navyLight}`, padding: "40px 20px 24px", marginTop: 60 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, marginBottom: 36 }}>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: COLORS.white, marginBottom: 10 }}>
              Rate My <span style={{ color: COLORS.gold }}>BAU</span>
            </div>
            <p style={{ fontSize: 13, color: COLORS.gray400, lineHeight: 1.7, margin: 0 }}>Anonymous student reviews for Bahçeşehir University professors. Helping students make informed decisions.</p>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: COLORS.white, marginBottom: 14, fontSize: 14 }}>Navigation</div>
            {[ ["home", "Home"], ["professors", "Professors"], ["suggestions", "Suggest a Professor"] ].map(([id, label]) => (
              <div key={id} onClick={() => setPage(id)} style={{ cursor: "pointer", color: COLORS.gray400, fontSize: 13, marginBottom: 8 }}>{label}</div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: COLORS.white, marginBottom: 14, fontSize: 14 }}>Legal</div>
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Use", href: "/terms" },
              { label: "Disclaimer", href: "/disclaimer" },
              { label: "Community Guidelines", href: "/guidelines" },
            ].map((item) => (
              <div key={item.href} style={{ marginBottom: 8 }}>
                <Link href={item.href} style={{ color: COLORS.gray400, fontSize: 13, textDecoration: "none" }}>{item.label}</Link>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: COLORS.white, marginBottom: 14, fontSize: 14 }}>About</div>
            <p style={{ fontSize: 13, color: COLORS.gray400, lineHeight: 1.7, margin: 0 }}>Rate My BAU is an independent student platform. It is not affiliated with or endorsed by Bahçeşehir University.</p>
          </div>
        </div>
        <AdPlaceholder />
        <div style={{ borderTop: `1px solid ${COLORS.navyLight}`, paddingTop: 20, textAlign: "center", fontSize: 12, color: COLORS.gray600 }}>
          © 2025 Rate My BAU · All reviews are anonymous student opinions · Not affiliated with Bahçeşehir University
        </div>
      </div>
    </footer>
  );
}

function FAB({ setPage, page }) {
  const [open, setOpen] = useState(false);
  if (page === "home") return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200, display: "flex", flexDirection: "column-reverse", alignItems: "flex-end", gap: 10 }}>
      {open && (
        <>
          <button onClick={() => { setPage("professors"); setOpen(false); }} style={{ background: COLORS.navy, color: COLORS.white, border: "none", borderRadius: 12, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit", boxShadow: "0 4px 16px rgba(10,22,40,0.25)", whiteSpace: "nowrap" }}>
            ⭐ Rate a Professor
          </button>
          <button onClick={() => { setPage("suggestions"); setOpen(false); }} style={{ background: COLORS.gold, color: COLORS.navy, border: "none", borderRadius: 12, padding: "10px 18px", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit", boxShadow: "0 4px 16px rgba(232,184,75,0.35)", whiteSpace: "nowrap" }}>
            + Suggest Professor
          </button>
        </>
      )}
      <button onClick={() => setOpen((o) => !o)} style={{ width: 52, height: 52, borderRadius: "50%", background: COLORS.red, color: COLORS.white, border: "none", fontSize: 22, cursor: "pointer", boxShadow: "0 6px 20px rgba(200,16,46,0.40)", transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
    </div>
  );
}

export default function Page() {
  const [page, setPage] = useState("home");
  const [professors, setProfessors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: professorsData, error: professorsError } = await supabase.from("professors").select("*").order("id", { ascending: true });
      const { data: reviewsData, error: reviewsError } = await supabase.from("reviews").select("*").eq("status", "active").order("created_at", { ascending: false });
      const { data: suggestionsData, error: suggestionsError } = await supabase.from("professor_suggestions").select("*").order("created_at", { ascending: false });

      if (professorsError) console.error("Professors error:", professorsError);
      if (reviewsError) console.error("Reviews error:", reviewsError);
      if (suggestionsError) console.error("Suggestions error:", suggestionsError);

      const formattedReviews = (reviewsData || []).map((r) => ({
        id: r.id,
        professorId: r.professor_id,
        rating: r.rating,
        teachingQuality: r.teaching_quality,
        clarity: r.clarity,
        fairness: r.fairness,
        difficulty: r.difficulty,
        wouldTakeAgain: r.would_take_again,
        course: r.course,
        semester: r.semester,
        comment: r.comment,
        timestamp: r.created_at,
      }));

      const formattedProfessors = (professorsData || []).map((p) => ({
        id: p.id,
        name: p.full_name,
        department: p.department,
        courses: p.courses || [],
        avgRating: Number(p.avg_rating || 0),
        totalReviews: p.total_reviews || 0,
        image: p.image_url || null,
        tags: p.tags || [],
        title: p.academic_title || null,
        faculty: p.faculty || null,
        email: p.email || null,
        profileUrl: p.profile_url || null,
        sourceUrl: p.source_url || null,
        note: p.note || null,
      }));

      const formattedSuggestions = (suggestionsData || []).map((s) => ({
        id: s.id,
        name: s.full_name,
        department: s.department,
        course: s.course,
        note: s.note,
        status: s.status,
        timestamp: s.created_at,
        supportCount: s.support_count || 0,
      }));

      setReviews(formattedReviews);
      setProfessors(mergeProfessorStats(formattedProfessors, formattedReviews));
      setSuggestions(formattedSuggestions);
    };

    loadData();
  }, []);

  const handleAddReview = async (reviewData) => {
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          professor_id: reviewData.professorId,
          rating: reviewData.rating,
          teaching_quality: reviewData.teachingQuality || null,
          clarity: reviewData.clarity || null,
          fairness: reviewData.fairness || null,
          difficulty: reviewData.difficulty || null,
          would_take_again: reviewData.wouldTakeAgain,
          course: reviewData.course || null,
          semester: reviewData.semester || null,
          comment: reviewData.comment,
          status: "active",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Insert review error:", error);
      alert("Could not submit review.");
      return;
    }

    const newReview = {
      id: data.id,
      professorId: data.professor_id,
      rating: data.rating,
      teachingQuality: data.teaching_quality,
      clarity: data.clarity,
      fairness: data.fairness,
      difficulty: data.difficulty,
      wouldTakeAgain: data.would_take_again,
      course: data.course,
      semester: data.semester,
      comment: data.comment,
      timestamp: data.created_at,
    };

    setReviews((prev) => {
      const updated = [newReview, ...prev];
      setProfessors((current) => mergeProfessorStats(current, updated));
      return updated;
    });
  };

  const handleAddSuggestion = async (suggestionData) => {
    const { data, error } = await supabase
      .from("professor_suggestions")
      .insert([
        {
          full_name: suggestionData.name,
          department: suggestionData.department,
          course: suggestionData.course || null,
          note: suggestionData.note || null,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Insert suggestion error:", error);
      alert("Could not submit suggestion.");
      return;
    }

    const newSuggestion = {
      id: data.id,
      name: data.full_name,
      department: data.department,
      course: data.course,
      note: data.note,
      status: data.status,
      timestamp: data.created_at,
      supportCount: data.support_count || 0,
    };

    setSuggestions((s) => [newSuggestion, ...s]);
  };

  const currentProfessor = selectedProfessor ? professors.find((p) => p.id === selectedProfessor.id) || selectedProfessor : null;

  return (
    <div style={{ fontFamily: "'Instrument Sans', 'Helvetica Neue', Arial, sans-serif", background: COLORS.gray50, minHeight: "100vh" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" />
      <Header page={page} setPage={setPage} />
      <main>
        {page === "home" && <HomePage professors={professors} reviews={reviews} setPage={setPage} setSelectedProfessor={setSelectedProfessor} />}
        {page === "professors" && <ProfessorsPage professors={professors} setPage={setPage} setSelectedProfessor={setSelectedProfessor} />}
        {page === "professor" && currentProfessor && (
          <ProfessorPage professor={currentProfessor} professors={professors} reviews={reviews} setSelectedProfessor={setSelectedProfessor} setPage={setPage} onAddReview={handleAddReview} />
        )}
        {page === "suggestions" && <SuggestionsPage suggestions={suggestions} onAddSuggestion={handleAddSuggestion} />}
      </main>
      <Footer setPage={setPage} />
      <FAB setPage={setPage} page={page} />
    </div>
  );
}
