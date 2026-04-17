// ─────────────────────────────────────────────────────────────────────────────
// content.js
//
// This script is injected directly into LinkedIn and Indeed job pages.
// Its two jobs are:
//   1. Read the page's HTML to extract job info (title, company, salary)
//   2. Inject a "Save to JobBoard" button into the page UI
// ─────────────────────────────────────────────────────────────────────────────

// Wait a moment for the page's dynamic content to fully load before we try
// to read it. LinkedIn and Indeed are React/JS apps that render after the
// initial HTML loads, so we give them 1.5 seconds.
setTimeout(init, 1500);

function init() {
  const url = window.location.href;

  if (url.includes("linkedin.com")) {
    handleLinkedIn();
  } else if (url.includes("indeed.com")) {
    handleIndeed();
  }

  // Also listen for URL changes — LinkedIn is a single-page app (SPA),
  // meaning clicking a job doesn't reload the page, it just changes the URL.
  // We use a MutationObserver to detect when the page content changes
  // and re-run our logic.
  observePageChanges();
}


// ─────────────────────────────────────────────────────────────────────────────
// LINKEDIN
// We look for specific CSS class names that LinkedIn uses in their HTML.
// Note: LinkedIn occasionally changes these class names, so if it breaks,
// inspect the page and update the selectors below.
// ─────────────────────────────────────────────────────────────────────────────

function handleLinkedIn() {
  // Avoid injecting the button twice if it already exists
  if (document.getElementById("jobboard-btn")) return;

  // LinkedIn heavily obfuscates class names, so we search by text content and structure
  // Find all <p> elements and look for one that might be the job title
  const allElements = document.querySelectorAll("p, h1, h2");
  let titleEl = null;
  let companyEl = null;
  
  // Search for job title by looking for paragraphs with specific text patterns
  for (let el of allElements) {
    const text = el.innerText.trim();
    // Skip very short or very long text
    if (text.length > 5 && text.length < 100 && !text.includes("\n")) {
      // This might be a job title - we'll use heuristics
      // Job titles typically don't contain special characters and are 2-5 words
      if (/^[\w\s\-\/\(\),\.&]+$/.test(text) && text.split(" ").length <= 6) {
        titleEl = el;
        break;
      }
    }
  }

  // Find company by looking for links that point to company pages
  const companyLinks = document.querySelectorAll('a[href*="/company/"]');
  if (companyLinks.length > 0) {
    companyEl = companyLinks[0];
  }

  if (!titleEl || !companyEl) return; // Page hasn't loaded the job panel yet

  const jobData = {
    title:   titleEl.innerText.trim(),
    company: companyEl.innerText.trim(),
    salary:  "", // LinkedIn salary info is less reliable, skip for now
    url:     window.location.href,
    date:    new Date().toISOString().split("T")[0],
    source:  "LinkedIn",
  };

  // Insert button right after the title
  insertButton(titleEl, jobData, "afterend");
}


// ─────────────────────────────────────────────────────────────────────────────
// INDEED
// ─────────────────────────────────────────────────────────────────────────────

function handleIndeed() {
  if (document.getElementById("jobboard-btn")) return;

  const titleEl   = document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]') ||
                    document.querySelector(".jobsearch-JobInfoHeader-title");
  const companyEl = document.querySelector('[data-testid="inlineHeader-companyName"]') ||
                    document.querySelector(".jobsearch-InlineCompanyRating-companyHeader");
  const salaryEl  = document.querySelector('[data-testid="attribute_snippet_testid"]') ||
                    document.querySelector("#salaryInfoAndJobType");

  if (!titleEl || !companyEl) return;

  const jobData = {
    title:   titleEl.innerText.trim(),
    company: companyEl.innerText.trim(),
    salary:  salaryEl ? salaryEl.innerText.trim().split("\n")[0] : "",
    url:     window.location.href,
    date:    new Date().toISOString().split("T")[0],
    source:  "Indeed",
  };

  const insertTarget = document.querySelector(".jobsearch-JobInfoHeader-title-container") ||
                       document.querySelector(".jobsearch-CompanyInfoContainer");

  if (insertTarget) {
    insertButton(insertTarget, jobData, "afterend");
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// INSERT BUTTON
// Creates and injects a styled "Save to JobBoard" button into the page.
// We pass the jobData as a data attribute so the click handler can read it.
// ─────────────────────────────────────────────────────────────────────────────

function insertButton(target, jobData, position) {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "margin: 10px 0; display: inline-block;";

  const btn = document.createElement("button");
  btn.id = "jobboard-btn";
  btn.innerText = "⭐ Save to JobBoard";
  btn.style.cssText = `
    background: #7c8dff;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    font-family: sans-serif;
    transition: opacity 0.2s;
  `;

  btn.onmouseenter = () => btn.style.opacity = "0.85";
  btn.onmouseleave = () => btn.style.opacity = "1";

  // When clicked, save the job and update the button to show confirmation
  btn.onclick = () => saveJob(jobData, btn);

  wrapper.appendChild(btn);
  target.insertAdjacentElement(position, wrapper);
}


// ─────────────────────────────────────────────────────────────────────────────
// SAVE JOB
// This is the core function. It:
//   1. Reads existing jobs from storage (shared across all pages)
//   2. Checks if this job URL was already saved (no duplicates)
//   3. Adds the new job
//   4. Writes back to storage
//
// Uses BrowserCompat to handle both Chrome and Safari storage APIs.
// ─────────────────────────────────────────────────────────────────────────────

function saveJob(jobData, btn) {
  // Build the job object in the same format as your index.html tracker
  const newJob = {
    id:      Date.now().toString(),
    company: jobData.company,
    role:    jobData.title,
    salary:  jobData.salary,
    date:    jobData.date,
    link:    jobData.url,
    status:  "wishlist", // Default to Wishlist — user can drag it from there
    source:  jobData.source,
  };

  // Read existing jobs using cross-browser storage
  BrowserCompat.storageGet("jobtracker_jobs", (stored) => {
    const existing = stored || [];

    // Check for duplicates by URL
    const alreadySaved = existing.some(j => j.link === newJob.link);
    if (alreadySaved) {
      btn.innerText = "✓ Already saved!";
      btn.style.background = "#888";
      return;
    }

    // Add the new job and save back
    existing.push(newJob);
    BrowserCompat.storageSet("jobtracker_jobs", existing);

    // Also keep localStorage in sync for index.html
    localStorage.setItem("jobtracker_jobs", JSON.stringify(existing));

    // Update the button to show success
    btn.innerText = "✓ Saved to JobBoard!";
    btn.style.background = "#34d399";
    btn.style.cursor = "default";
    btn.onclick = null;
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// OBSERVE PAGE CHANGES
// LinkedIn is a Single Page App — navigating between jobs doesn't reload
// the page, it just swaps out the content. We watch for DOM changes and
// re-run our handler when the job panel updates.
// ─────────────────────────────────────────────────────────────────────────────

function observePageChanges() {
  let lastUrl = window.location.href;

  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      // Small delay to let the new content render
      setTimeout(() => {
        document.getElementById("jobboard-btn")?.remove();
        init();
      }, 1500);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
