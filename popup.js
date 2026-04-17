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

// ── Export jobs button ──────────────────────────────────────────────────
// Export all saved jobs as a JSON file that can be imported into the tracker
document.getElementById("export-btn").addEventListener("click", () => {
  BrowserCompat.storageGet("jobtracker_jobs", (jobs) => {
    jobs = jobs || [];
    const dataStr = JSON.stringify(jobs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jobboard-export-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  });
});

// ── Clear jobs button ──────────────────────────────────────────────────
// Clear all saved jobs from both storage and Firestore
document.getElementById("clear-btn").addEventListener("click", () => {
  if (confirm("Delete all saved jobs? This cannot be undone.")) {
    BrowserCompat.storageSet("jobtracker_jobs", []);
    localStorage.removeItem("jobtracker_jobs");
    
    // Also clear Firestore
    if (typeof db !== "undefined" && db) {
      db.collection("jobs").get().then(snapshot => {
        const batch = db.batch();
        snapshot.forEach(doc => batch.delete(doc.ref));
        return batch.commit();
      }).catch(e => console.warn("[JobBoard] Failed to clear Firestore:", e));
    }
    
    // Reload to show cleared state
    location.reload();
  }
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
