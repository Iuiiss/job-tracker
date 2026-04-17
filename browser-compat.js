// ─────────────────────────────────────────────────────────────────────────────
// browser-compat.js
//
// Cross-browser compatibility layer for Chrome and Safari extensions.
// Detects the browser and provides unified APIs for storage, Firestore, and tab operations.
// ─────────────────────────────────────────────────────────────────────────────

const BrowserCompat = (() => {
  const getBrowser = () => {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      return "chrome";
    } else if (typeof safari !== "undefined" && safari.extension) {
      return "safari";
    }
    return "unknown";
  };

  const browser = getBrowser();
  console.log("[JobBoard] Detected browser:", browser);

  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCvJl9E6FvzqlO-r0eoIH_tZ38u-uRQ8II",
    authDomain: "job-tracker-a4481.firebaseapp.com",
    projectId: "job-tracker-a4481",
    storageBucket: "job-tracker-a4481.firebasestorage.app",
    messagingSenderId: "706534879668",
    appId: "1:706534879668:web:1fedadee20b36ae44882e1"
  };

  // Initialize Firebase (check if already initialized)
  let db = null;
  try {
    if (typeof firebase !== "undefined" && firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    if (typeof firebase !== "undefined") {
      db = firebase.firestore();
    }
  } catch (e) {
    console.warn("[JobBoard] Firebase init failed:", e);
  }

  return {
    getBrowser: () => browser,

    /**
     * Read data from local storage.
     */
    storageGet: (key, callback) => {
      if (browser === "chrome") {
        chrome.storage.local.get(key, (result) => {
          callback(result[key]);
        });
      } else if (browser === "safari") {
        const value = localStorage.getItem(key);
        callback(value ? JSON.parse(value) : undefined);
      } else {
        callback(undefined);
      }
    },

    /**
     * Write data to local storage.
     */
    storageSet: (key, value, callback) => {
      if (browser === "chrome") {
        chrome.storage.local.set({ [key]: value }, () => {
          if (callback) callback();
        });
      } else if (browser === "safari") {
        localStorage.setItem(key, JSON.stringify(value));
        if (callback) callback();
      }
    },

    /**
     * Save job to Firestore.
     */
    firestoreSaveJob: (job, callback) => {
      if (!db) {
        console.warn("[JobBoard] Firestore not available");
        if (callback) callback(false);
        return;
      }
      // Use job.id as the document ID so we can update/delete later
      db.collection("jobs").doc(job.id).set(job)
        .then(() => {
          console.log("[JobBoard] Job saved to Firestore");
          if (callback) callback(true);
        })
        .catch((error) => {
          console.error("[JobBoard] Firestore error:", error);
          if (callback) callback(false);
        });
    },

    /**
     * Get all jobs from Firestore.
     */
    firestoreGetJobs: (callback) => {
      if (!db) {
        console.warn("[JobBoard] Firestore not available");
        if (callback) callback([]);
        return;
      }
      db.collection("jobs").get()
        .then((snapshot) => {
          const jobs = [];
          snapshot.forEach((doc) => {
            jobs.push({ id: doc.id, ...doc.data() });
          });
          if (callback) callback(jobs);
        })
        .catch((error) => {
          console.error("[JobBoard] Firestore error:", error);
          if (callback) callback([]);
        });
    },

    /**
     * Update job status in Firestore.
     */
    firestoreUpdateJob: (jobId, updates, callback) => {
      if (!db) {
        console.warn("[JobBoard] Firestore not available");
        if (callback) callback(false);
        return;
      }
      db.collection("jobs").doc(jobId).update(updates)
        .then(() => {
          if (callback) callback(true);
        })
        .catch((error) => {
          console.error("[JobBoard] Firestore update error:", error);
          if (callback) callback(false);
        });
    },

    /**
     * Delete job from Firestore.
     */
    firestoreDeleteJob: (jobId, callback) => {
      if (!db) {
        console.warn("[JobBoard] Firestore not available");
        if (callback) callback(false);
        return;
      }
      db.collection("jobs").doc(jobId).delete()
        .then(() => {
          if (callback) callback(true);
        })
        .catch((error) => {
          console.error("[JobBoard] Firestore delete error:", error);
          if (callback) callback(false);
        });
    },

    /**
     * Clear all jobs from Firestore.
     */
    firestoreClearAll: (callback) => {
      if (!db) {
        console.warn("[JobBoard] Firestore not available");
        if (callback) callback(false);
        return;
      }
      db.collection("jobs").get()
        .then(snapshot => {
          const batch = db.batch();
          snapshot.forEach(doc => batch.delete(doc.ref));
          return batch.commit();
        })
        .then(() => {
          console.log("[JobBoard] Cleared all jobs from Firestore");
          if (callback) callback(true);
        })
        .catch((error) => {
          console.error("[JobBoard] Clear all error:", error);
          if (callback) callback(false);
        });
    },

    openTab: (url) => {
      if (browser === "chrome") {
        chrome.tabs.create({ url: url });
      } else if (browser === "safari") {
        if (safari.application) {
          safari.application.activeBrowserWindow.openNewTab(true);
          try {
            const newTab = safari.application.activeBrowserWindow.activeTab;
            if (newTab) {
              newTab.url = url;
            }
          } catch (e) {
            console.warn("[JobBoard] Could not set tab URL in Safari", e);
            alert("JobBoard Tracker:\n\n" + url);
          }
        }
      }
    },
  };
})();
