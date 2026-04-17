// ─────────────────────────────────────────────────────────────────────────────
// popup.js
//
// Runs inside the extension popup when you click the toolbar icon.
// Reads saved jobs from Firestore and displays stats.
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// LOAD STATS
// Read jobs from Firestore and update stats (real-time sync)
// ═══════════════════════════════════════════════════════════════════════════════

function loadStats() {
  // Try Firestore first
  if (typeof firebase !== "undefined" && firebase.apps && firebase.apps.length > 0) {
    try {
      const db = firebase.firestore();
      db.collection("jobs").get()
        .then(snapshot => {
          const jobs = snapshot.docs.map(doc => doc.data());
          updateStats(jobs);
        })
        .catch(err => {
          console.warn("[JobBoard] Firestore error, using localStorage:", err);
          fallbackLoadStats();
        });
    } catch (e) {
      fallbackLoadStats();
    }
  } else {
    fallbackLoadStats();
  }
}

function fallbackLoadStats() {
  BrowserCompat.storageGet("jobtracker_jobs", (jobs) => {
    jobs = jobs || [];
    updateStats(jobs);
  });
}

function updateStats(jobs) {
  document.getElementById("stat-total").textContent = jobs.length;
  document.getElementById("stat-applied").textContent = jobs.filter(j => j.status === "applied").length;
  document.getElementById("stat-interviews").textContent = jobs.filter(j => j.status === "interview").length;
  document.getElementById("stat-offers").textContent = jobs.filter(j => j.status === "offer").length;
}

// Load on startup
loadStats();

// Refresh every 2 seconds to stay in sync
setInterval(loadStats, 2000);

// ── Open tracker button ────────────────────────────────────────────────────
document.getElementById("open-btn").addEventListener("click", () => {
  const trackerUrl = "https://iuiiss.github.io/job-tracker/index.html";
  BrowserCompat.openTab(trackerUrl);
});

// ── Export jobs button ────────────────────────────────────────────────────
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
