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
    // Clear both storage systems
    BrowserCompat.storageSet("jobtracker_jobs", [], () => {
      localStorage.removeItem("jobtracker_jobs");
      
      // Also clear Firestore
      BrowserCompat.firestoreClearAll(() => {
        console.log("[JobBoard] Firestore clear complete");
      });
      
      // Update UI directly to show cleared state
      document.getElementById("stat-total").textContent = "0";
      document.getElementById("stat-interviews").textContent = "0";
      document.getElementById("stat-offers").textContent = "0";
      
      const list = document.getElementById("jobs-list");
      list.innerHTML = '<div class="empty">No jobs saved yet.<br>Visit LinkedIn or Indeed to get started.</div>';
    });
  }
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
