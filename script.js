// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_ATTENDEES = 50;

const TEAM_CONFIG = {
  water: { id: "waterCount", name: "Team Water Wise" },
  zero:  { id: "zeroCount",  name: "Team Net Zero"   },
  power: { id: "powerCount", name: "Team Renewables"  },
};

// ─── State (loaded from localStorage) ────────────────────────────────────────
function loadState() {
  try {
    const saved = localStorage.getItem("summitState");
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return {
    totalCount: 0,
    teamCounts: { water: 0, zero: 0, power: 0 },
    attendees: [],   // { name, team }
  };
}

function saveState(state) {
  try {
    localStorage.setItem("summitState", JSON.stringify(state));
  } catch (e) { /* ignore */ }
}

let state = loadState();

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const attendeeCountEl = document.getElementById("attendeeCount");
const progressBarEl   = document.getElementById("progressBar");
const greetingEl      = document.getElementById("greeting");
const checkInForm     = document.getElementById("checkInForm");
const nameInput       = document.getElementById("attendeeName");
const teamSelect      = document.getElementById("teamSelect");

// ─── Render helpers ───────────────────────────────────────────────────────────
function renderAll() {
  // Attendance count & progress bar
  attendeeCountEl.textContent = state.totalCount;
  const pct = Math.min((state.totalCount / MAX_ATTENDEES) * 100, 100);
  progressBarEl.style.width = pct + "%";

  // Team counts
  for (const [key, cfg] of Object.entries(TEAM_CONFIG)) {
    document.getElementById(cfg.id).textContent = state.teamCounts[key];
  }

  // Attendee list
  renderAttendeeList();
}

function renderAttendeeList() {
  // Remove old list if present
  let existing = document.getElementById("attendeeListSection");
  if (existing) existing.remove();

  if (state.attendees.length === 0) return;

  const teamStats = document.querySelector(".team-stats");

  const section = document.createElement("div");
  section.id = "attendeeListSection";
  section.style.cssText = "margin-top:30px;padding-top:30px;border-top:2px solid #f1f5f9;";

  const title = document.createElement("h3");
  title.style.cssText = "color:#64748b;font-size:16px;margin-bottom:16px;text-align:center;";
  title.textContent = "Attendee List";
  section.appendChild(title);

  const list = document.createElement("ul");
  list.style.cssText = "list-style:none;display:flex;flex-direction:column;gap:8px;";

  state.attendees.forEach(({ name, team }) => {
    const li = document.createElement("li");
    const cfg = TEAM_CONFIG[team];
    const teamClass = team; // water / zero / power

    li.style.cssText = `
      display:flex;align-items:center;justify-content:space-between;
      padding:10px 16px;border-radius:10px;font-size:15px;
    `;

    // Reuse team card background colors via inline style mapping
    const bgMap = { water: "#e8f7fc", zero: "#ecfdf3", power: "#fff7ed" };
    li.style.backgroundColor = bgMap[team] || "#f1f5f9";

    const nameSpan = document.createElement("span");
    nameSpan.style.cssText = "font-weight:600;color:#2c3e50;";
    nameSpan.textContent = name;

    const teamSpan = document.createElement("span");
    teamSpan.style.cssText = "font-size:13px;color:#64748b;font-weight:500;";
    teamSpan.textContent = cfg.name;

    li.appendChild(nameSpan);
    li.appendChild(teamSpan);
    list.appendChild(li);
  });

  section.appendChild(list);
  teamStats.appendChild(section);
}

// ─── Greeting ─────────────────────────────────────────────────────────────────
function showGreeting(name, team) {
  const teamName = TEAM_CONFIG[team]?.name ?? team;
  greetingEl.style.display = "block";
  greetingEl.className = "success-message";

  // Goal reached?
  if (state.totalCount >= MAX_ATTENDEES) {
    const winner = getWinningTeam();
    greetingEl.innerHTML = `🎉 Goal reached! Congratulations to <strong>${winner}</strong> — the top team! Welcome, <strong>${name}</strong>!`;
  } else {
    greetingEl.innerHTML = `🎉 Welcome, <strong>${name}</strong> from <strong>${teamName}</strong>!`;
  }
}

function getWinningTeam() {
  let max = -1, winner = "";
  for (const [key, cfg] of Object.entries(TEAM_CONFIG)) {
    if (state.teamCounts[key] > max) {
      max = state.teamCounts[key];
      winner = cfg.name;
    }
  }
  return winner;
}

// ─── Check-in handler ─────────────────────────────────────────────────────────
checkInForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;

  if (!name || !team) return;

  // Guard against exceeding max
  if (state.totalCount >= MAX_ATTENDEES) {
    greetingEl.style.display = "block";
    greetingEl.className = "success-message";
    greetingEl.textContent = "🚫 The event is at full capacity!";
    return;
  }

  // Update state
  state.totalCount += 1;
  state.teamCounts[team] += 1;
  state.attendees.unshift({ name, team }); // newest first
  saveState(state);

  // Render
  renderAll();
  showGreeting(name, team);

  // Reset form
  nameInput.value = "";
  teamSelect.value = "";
  nameInput.focus();
});

// ─── Initial render on page load ──────────────────────────────────────────────
renderAll();


