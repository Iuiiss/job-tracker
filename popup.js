// ─────────────────────────────────────────────────────────────────────────────
// popup.js
//
// Runs inside the extension popup when you click the toolbar icon.
// Reads saved jobs from storage and displays them.
// Uses BrowserCompat for cross-browser support (Chrome and Safari).
// ─────────────────────────────────────────────────────────────────────────────

// Read jobs using cross-browser storage API
BrowserCompat.storageGet("jobtracker_jobs", (jobs) => {
  jobs = jobs || [];

  // ── Stats ──────────────────────────────────────────────────────────────────
  document.getElementById("stat-total").textContent = jobs.length;
  document.getElementById("stat-interviews").textContent =
    jobs.filter(j => j.status === "interview").length;
  document.getElementById("stat-offers").textContent =
    jobs.filter(j => j.status === "offer").length;

  // ── Recent jobs list (last 4 saved) ───────────────────────────────────────
  const list = document.getElementById("jobs-list");

  if (jobs.length === 0) return; // leave the empty state message

  list.innerHTML = "";

  // Show the 4 most recently saved jobs (last items in the array)
  const recent = [...jobs].reverse().slice(0, 4);

  recent.forEach(job => {
    const item = document.createElement("div");
    item.className = "job-item";
    item.innerHTML = `
      <div class="job-company">${job.company}</div>
      <div class="job-role">${job.role}</div>
      <span class="job-status status-${job.status}">${capitalize(job.status)}</span>
    `;
    list.appendChild(item);
  });
});

// ── Open tracker button ────────────────────────────────────────────────────
// When clicked, opens your index.html tracker in a new tab.
// Uses BrowserCompat to handle both Chrome and Safari.
document.getElementById("open-btn").addEventListener("click", () => {
  const trackerUrl = "https://iuiiss.github.io/job-tracker/index.html";
  BrowserCompat.openTab(trackerUrl);
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
