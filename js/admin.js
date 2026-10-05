// === ADMIN DOM REFERENCES: Connect dashboard controls to their JavaScript behavior. ===
const loginScreen = document.getElementById("adminLoginScreen");
const dashboardShell = document.getElementById("adminDashboardShell");
const loginForm = document.getElementById("adminLoginForm");
const loginError = document.getElementById("loginError");
const adminEmailInput = document.getElementById("adminEmail");
const passwordInput = document.getElementById("password");
const backToStudentBtn = document.getElementById("backToStudent");
const logoutBtn = document.getElementById("logoutBtn");
const mobileSidebarToggle = document.getElementById("mobileSidebarToggle");
const sidebar = document.getElementById("sidebar");
const navItems = document.querySelectorAll(".nav-item[data-section]");
const sections = document.querySelectorAll(".admin-section");
const adminGreeting = document.getElementById("adminGreeting");
const adminCurrentDate = document.getElementById("adminCurrentDate");

const programFilter = document.getElementById("programFilter");
const purposeFilter = document.getElementById("purposeFilter");
const dateFilter = document.getElementById("dateFilter");
const searchInput = document.getElementById("searchInput");
const logsTableBody = document.getElementById("logsTableBody");
const pageSummary = document.getElementById("pageSummary");
const pageNumbers = document.getElementById("pageNumbers");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");

const reportPeriodSelect = document.getElementById("reportPeriodSelect");
const customDateGroup = document.getElementById("customDateGroup");
const reportStartDate = document.getElementById("reportStartDate");
const reportEndDate = document.getElementById("reportEndDate");
const libraryOpenTime = document.getElementById("libraryOpenTime");
const libraryCloseTime = document.getElementById("libraryCloseTime");
const saveLibraryHoursBtn = document.getElementById("saveLibraryHoursBtn");
const libraryHoursMessage = document.getElementById("libraryHoursMessage");
const suggestionsList = document.getElementById("suggestionsList");

// === ADMIN STATE: Store loaded records, pagination state, and the active dashboard section. ===
let visitorRecords = [];
let suggestionRecords = [];

let currentPage = 1;
const pageSize = 10;

// === RECORD ACCESS: Return the visitor records currently loaded from the API. ===
function getRecords() {
  return visitorRecords;
}

// === RECORD LOADING: Authenticate the admin, fetch PHP data, and normalize each visitor row. ===
async function loadVisitorRecords() {
  console.log("Loading visitor records from PHP...");

  try {
    // Get the currently logged-in admin session
    const {
      data: { session },
      error: sessionError,
    } = await db.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (!session) {
      console.log("No administrator session found.");
      return;
    }

    // Send the admin JWT to PHP
    const response = await fetch("api/visitor_logs.php", {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Visitor API error:", data);

      throw new Error(
        data.message || `Server returned ${response.status}`
      );
    }

    if (!Array.isArray(data)) {
      console.error("Invalid visitor data:", data);

      throw new Error(
        data.message || "Invalid response from server."
      );
    }

    visitorRecords = data.map((row) => {
      const createdAt = new Date(row.created_at);

      return {
        id: row.id,
        name: row.student_name,
        program: row.program,
        year: row.year_level,
        purpose: row.purpose,

        date: createdAt.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),

        time: createdAt.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),

        createdAt: row.created_at,
      };
    });

    console.log(
      "Visitor records loaded:",
      visitorRecords
    );

    refreshDashboard();

  } catch (error) {

    console.error(
      "Unable to load visitor records:",
      error
    );
  }
}

// === AUTO REFRESH: Keep the dashboard updated while an administrator is logged in. ===
// The dashboard polls the server every few seconds so the staff page stays close to real-time visitor activity.
let visitorRefreshInterval = null;

function startVisitorAutoRefresh() {
  // Load immediately
  loadVisitorRecords();

  // Stop an existing timer if there is one
  if (visitorRefreshInterval) {
    clearInterval(visitorRefreshInterval);
  }

  // Check Supabase every 5 seconds
  visitorRefreshInterval = setInterval(() => {
    console.log("Checking for new visitors...");

    loadVisitorRecords();
  }, 5000);
}

// === DASHBOARD REFRESH: Recalculate and redraw all views using the latest records. ===
// After any record change, every metric and panel is recomputed so the displayed values stay consistent.
function refreshDashboard() {
  calculateStats();
  renderActivityChart();
  renderProgramBreakdown();
  renderTable();
  updateReports();
  renderSuggestions();
}

// === AUTHENTICATED VIEW: Hide login and reveal the staff dashboard. ===
// Once the admin session is verified, we remove the login UI and allow the staff tools to become visible.
function showDashboard() {
  loginScreen?.classList.add("hidden");
  dashboardShell?.classList.remove("hidden");
}

// === LOGGED-OUT VIEW: Hide staff content and reveal the administrator login. ===
// If the session expires or the user is not an admin, we show the login page again to protect the dashboard.
function showLogin() {
  loginScreen?.classList.remove("hidden");
  dashboardShell?.classList.add("hidden");
}

// === LIBRARY HOURS: Load the current schedule into the administrator controls. ===
// The admin form is pre-filled with the current schedule so staff can adjust the library opening and closing times quickly.
async function loadLibraryHours() {
  try {
    const response = await fetch("api/library_status.php", {
      cache: "no-store",
    });
    const data = await response.json();
    const weekdaySchedule = data.schedule?.[1];

    if (!response.ok || !data.success || !weekdaySchedule) {
      throw new Error(data.message || "Unable to load library hours.");
    }

    libraryOpenTime.value = weekdaySchedule.open;
    libraryCloseTime.value = weekdaySchedule.close;
  } catch (error) {
    console.error("Unable to load library hours:", error);
    libraryHoursMessage.textContent = "Unable to load library hours.";
  }
}

// === LIBRARY HOURS: Save new hours through the authenticated settings endpoint. ===
// This updates the stored schedule used by the student site to determine whether the library is open or closed.
async function saveLibraryHours() {
  const open = libraryOpenTime.value;
  const close = libraryCloseTime.value;

  if (!open || !close || open >= close) {
    libraryHoursMessage.textContent = "Opening time must be before closing time.";
    return;
  }

  saveLibraryHoursBtn.disabled = true;
  libraryHoursMessage.textContent = "Saving library hours...";

  try {
    const {
      data: { session },
      error: sessionError,
    } = await db.auth.getSession();

    if (sessionError || !session) {
      throw new Error("Administrator session expired.");
    }

    const response = await fetch("api/library_status.php", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ open, close }),
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to save library hours.");
    }

    libraryHoursMessage.textContent = "Library hours saved successfully.";
  } catch (error) {
    console.error("Unable to save library hours:", error);
    libraryHoursMessage.textContent = error.message;
  } finally {
    saveLibraryHoursBtn.disabled = false;
  }
}

// === HEADER HELPERS: Generate the time-based greeting and displayed current date. ===
// Small UI helpers improve the staff dashboard experience by showing a personalized greeting and the current date.
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function updateHeaderMeta() {
  if (adminGreeting) {
    adminGreeting.textContent = `${getGreeting()}, Library Administrator`;
  }

  if (adminCurrentDate) {
    adminCurrentDate.textContent = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
}

function getDateKey(date) {
  return date.toISOString().split("T")[0];
}

function getTodayRecords(records) {
  const today = new Date();
  const todayKey = getDateKey(today);
  return records.filter((record) => {
    const recordDate = new Date(record.createdAt || record.date);
    return getDateKey(recordDate) === todayKey;
  });
}

function getYesterdayRecords(records) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday);
  return records.filter((record) => {
    const recordDate = new Date(record.createdAt || record.date);
    return getDateKey(recordDate) === yesterdayKey;
  });
}

async function loadSuggestions() {
  try {
    const response = await fetch("api/suggestions.php", {
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load suggestions.");
    }

    suggestionRecords = Array.isArray(data.items) ? data.items : [];
    renderSuggestions();
  } catch (error) {
    console.error("Unable to load suggestions:", error);
    suggestionRecords = [];
    renderSuggestions();
  }
}

function renderSuggestions() {
  if (!suggestionsList) return;

  if (!suggestionRecords.length) {
    suggestionsList.innerHTML = '<div class="empty-state">No suggestions submitted yet.</div>';
    return;
  }

  suggestionsList.innerHTML = suggestionRecords
    .slice()
    .reverse()
    .map((item) => {
      const createdAt = item.created_at ? new Date(item.created_at) : new Date();
      const date = createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return `
        <article class="suggestion-card">
          <div class="suggestion-meta">
            <strong>Visitor Feedback</strong>
            <span>${date}</span>
          </div>
          <p class="suggestion-message">${(item.message || "").replace(/[<>]/g, '')}</p>
        </article>
      `;
    })
    .join("");
}

// === DASHBOARD STATS: Calculate today's totals, purpose counts, and daily trend. ===
// This summary section translates the raw visitor data into useful KPIs that the library administrator can review at a glance.
function calculateStats() {
  const records = getRecords();
  const todayRecords = getTodayRecords(records);
  const yesterdayRecords = getYesterdayRecords(records);
  const totalToday = todayRecords.length;
  const yesterdayTotal = yesterdayRecords.length;

  const studyVisits = todayRecords.filter(
    (record) => record.purpose === "Study",
  ).length;
  const borrowVisits = todayRecords.filter(
    (record) => record.purpose === "Borrow Book",
  ).length;

  const trend =
    yesterdayTotal === 0
      ? 0
      : ((totalToday - yesterdayTotal) / yesterdayTotal) * 100;

  if (document.getElementById("statTodayVisitors")) {
    document.getElementById("statTodayVisitors").textContent = totalToday;
  }

  if (document.getElementById("statTodayTrend")) {
    document.getElementById("statTodayTrend").textContent =
      `${trend >= 0 ? "+" : ""}${trend.toFixed(0)}% from yesterday`;
  }

  if (document.getElementById("statLoggedVisitors")) {
    document.getElementById("statLoggedVisitors").textContent = totalToday;
  }

  if (document.getElementById("statStudyVisits")) {
    document.getElementById("statStudyVisits").textContent = studyVisits;
  }

  if (document.getElementById("statBorrowVisits")) {
    document.getElementById("statBorrowVisits").textContent = borrowVisits;
  }

  return { totalToday, studyVisits, borrowVisits, trend };
}

// === ACTIVITY CHART: Group today's records by hour and render the visitor bars. ===
// The chart visually shows when the library sees the heaviest traffic, which helps with resource planning.
function renderActivityChart() {
  const chart = document.getElementById("activityChart");
  if (!chart) return;

  const labels = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM"];
  const records = getRecords();
  const hourlyMap = Array.from({ length: 6 }, (_, index) => {
    const hour = index + 8;
    return {
      label: labels[index],
      value: records.filter((record) => {
        const recordDate = new Date(record.createdAt || record.date);
        const recordHour = recordDate.getHours();
        return (
          recordHour === hour &&
          getDateKey(recordDate) === getDateKey(new Date())
        );
      }).length,
    };
  });

  const maxValue = Math.max(...hourlyMap.map((item) => item.value), 1);

  chart.innerHTML = hourlyMap
    .map(
      (item) => `
    <div class="chart-bar-group">
      <span class="chart-value">${item.value}</span>
      <div class="chart-bar" style="height:${(item.value / maxValue) * 150 + 26}px"></div>
      <span class="chart-label">${item.label}</span>
    </div>
  `,
    )
    .join("");
}

// === PROGRAM BREAKDOWN: Count today's visitors by program and render progress bars. ===
// This panel makes it easy to see which academic groups are using the library most frequently.
function renderProgramBreakdown() {
  const container = document.getElementById("programBreakdown");
  if (!container) return;

  const records = getRecords();
  const todayRecords = getTodayRecords(records);
  const programs = [
    "BS Information Technology",
    "BS Computer Science",
    "BS Education",
    "BS Psychology",
    "Other",
  ];
  const counts = programs.map((program) => ({
    program,
    count: todayRecords.filter((record) => record.program === program).length,
  }));

  const maxCount = Math.max(...counts.map((item) => item.count), 1);

  container.innerHTML = counts
    .map(
      (item) => `
    <div class="program-item">
      <span class="program-name">${item.program}</span>
      <div class="program-bar"><span style="width:${(item.count / maxCount) * 100}%"></span></div>
      <span class="program-total">${item.count}</span>
    </div>
  `,
    )
    .join("");
}

// === LOG FILTERING: Apply search, program, purpose, and date filters to visitor records. ===
// Filtering keeps the data table focused and makes it easier for staff to review only the records they need.
function getFilteredRecords() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  const program = programFilter?.value || "All Programs";
  const purpose = purposeFilter?.value || "All Purposes";
  const dateValue = dateFilter?.value || "All Dates";

  let records = getRecords();

  if (query) {
    records = records.filter((record) =>
      record.name.toLowerCase().includes(query),
    );
  }

  if (program !== "All Programs") {
    records = records.filter((record) => record.program === program);
  }

  if (purpose !== "All Purposes") {
    records = records.filter((record) => record.purpose === purpose);
  }

  if (dateValue === "Today") {
    records = records.filter(
      (record) =>
        getDateKey(new Date(record.createdAt || record.date)) ===
        getDateKey(new Date()),
    );
  } else if (dateValue === "Yesterday") {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const key = getDateKey(yesterday);
    records = records.filter(
      (record) => getDateKey(new Date(record.createdAt || record.date)) === key,
    );
  }

  return records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// === LOG TABLE: Paginate filtered records and update rows, page numbers, and controls. ===
// This function manages the visible page of visitor logs so the table stays readable even with many entries.
function renderTable() {
  const records = getFilteredRecords();
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  currentPage = Math.min(currentPage, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecords = records.slice(startIndex, startIndex + pageSize);

  logsTableBody.innerHTML = paginatedRecords.length
    ? paginatedRecords
        .map(
          (record) => `
        <tr>
          <td>${record.name}</td>
          <td>${record.program}</td>
          <td>${record.year}</td>
          <td><span class="pill ${record.purpose === "Study" ? "study" : "borrow"}">${record.purpose}</span></td>
          <td>${record.date}</td>
          <td>${record.time}</td>
        </tr>
      `,
        )
        .join("")
    : `<tr><td colspan="6" style="text-align:center; color: var(--muted); padding: 28px 16px;">No visitor records match the current filters.</td></tr>`;

  pageSummary.textContent = `Showing ${records.length ? startIndex + 1 : 0}–${Math.min(startIndex + paginatedRecords.length, records.length)} of ${records.length} logs`;

  pageNumbers.innerHTML = Array.from(
    { length: totalPages },
    (_, idx) => idx + 1,
  )
    .map(
      (num) =>
        `<button class="page-number ${num === currentPage ? "active" : ""}" data-page="${num}" type="button">${num}</button>`,
    )
    .join("");

  pageNumbers.querySelectorAll(".page-number").forEach((button) => {
    button.addEventListener("click", () => {
      currentPage = Number(button.dataset.page);
      renderTable();
    });
  });

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

// === CSV EXPORT: Convert the filtered table data into a downloadable CSV file. ===
// Staff can export the current filtered records into a spreadsheet-friendly format for later reporting or archiving.
function exportCsv() {
  const records = getFilteredRecords();
  const headers = [
    "Student Name",
    "Program / Course",
    "Year Level",
    "Purpose",
    "Date",
    "Time",
  ];
  const csvRows = [headers.join(",")];

  records.forEach((record) => {
    const row = [
      record.name,
      record.program,
      record.year,
      record.purpose,
      record.date,
      record.time,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",");
    csvRows.push(row);
  });

  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ssu-library-visitors.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// === REPORTING: Filter records by period and update report totals by purpose. ===
// Reports summarize the data by date range so administrators can analyze visitor behavior over time.
function updateReports() {
  const period = reportPeriodSelect.value;
  const records = getRecords();
  let filtered = [...records];

  if (period === "Today") {
    filtered = getTodayRecords(records);
  } else if (period === "This Week") {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    filtered = records.filter((record) => {
      const recordDate = new Date(record.createdAt || record.date);
      return recordDate >= start && recordDate <= now;
    });
  } else if (period === "This Month") {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    filtered = records.filter((record) => {
      const recordDate = new Date(record.createdAt || record.date);
      return recordDate >= start && recordDate <= now;
    });
  } else if (period === "Custom Date") {
    if (!reportStartDate.value || !reportEndDate.value) {
      filtered = [];
    } else {
      const start = new Date(reportStartDate.value);
      const end = new Date(reportEndDate.value);
      filtered = records.filter((record) => {
        const recordDate = new Date(record.createdAt || record.date);
        return recordDate >= start && recordDate <= end;
      });
    }
  }

  const total = filtered.length;
  const study = filtered.filter((record) => record.purpose === "Study").length;
  const borrow = filtered.filter(
    (record) => record.purpose === "Borrow Book",
  ).length;

  const totalVisitorsEl = document.getElementById("reportTotalVisitors");
  const studyVisitorsEl = document.getElementById("reportStudyVisits");
  const borrowVisitorsEl = document.getElementById("reportBorrowVisits");

  if (totalVisitorsEl) totalVisitorsEl.textContent = total;
  if (studyVisitorsEl) studyVisitorsEl.textContent = study;
  if (borrowVisitorsEl) borrowVisitorsEl.textContent = borrow;
}

// === REPORT CONTROLS: Show custom date inputs only for the custom report period. ===
// This UI behavior keeps the reporting form simple while still supporting custom date ranges when needed.
function handleReportPeriodChange() {
  const isCustom = reportPeriodSelect.value === "Custom Date";
  customDateGroup?.classList.toggle("hidden", !isCustom);
  updateReports();
}

// === SECTION NAVIGATION: Activate one dashboard panel and close mobile navigation when needed. ===
// The sidebar behavior switches between the dashboard, logs, reports, and profile views without reloading the page.
function setActiveSection(sectionName) {
  navItems.forEach((item) => {
    const active = item.dataset.section === sectionName;
    item.classList.toggle("active", active);
  });

  sections.forEach((section) => {
    section.classList.toggle("active", section.dataset.panel === sectionName);
  });

  if (window.innerWidth <= 760 && sidebar) {
    sidebar.classList.remove("open");
  }
}

// === ADMIN LOGIN: Authenticate with Supabase and verify the account has the admin role. ===
// This is the server-side protected entry point for the staff portal. It confirms the account is a true library administrator before granting access.
async function handleLogin(event) {
  event.preventDefault();

  const email = adminEmailInput.value.trim();
  const password = passwordInput.value;

  loginError.textContent = "";

  if (!email || !password) {
    loginError.textContent = "Please enter your admin email and password.";
    return;
  }

  try {
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    const user = data.user;

    if (!user) {
      throw new Error("Unable to authenticate administrator.");
    }

    // Verify that this account is actually an admin
    const { data: profile, error: profileError } = await db
      .from("admin_profiles")
      .select("admin_id, name, role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      await db.auth.signOut();
      throw new Error("Unable to verify administrator.");
    }

    if (profile.role !== "admin") {
      await db.auth.signOut();
      throw new Error("Access denied. Administrator account required.");
    }

    console.log("Administrator verified:", profile);

    showDashboard();
    setActiveSection("dashboard");

    startVisitorAutoRefresh();
  } catch (error) {
    console.error(error);

    loginError.textContent = error.message || "Unable to log in.";
  }
}

// === ADMIN LOGOUT: Stop polling, sign out, clear data, and return to the login screen. ===
// Logging out ends the active session, clears the dashboard state, and forces the user back to the secure login form.
async function handleLogout() {
  if (visitorRefreshInterval) {
    clearInterval(visitorRefreshInterval);
    visitorRefreshInterval = null;
  }

  await db.auth.signOut();

  visitorRecords = [];

  showLogin();

  loginForm.reset();
  loginError.textContent = "";

  if (sidebar) {
    sidebar.classList.remove("open");
  }
}

// === SESSION RESTORE: Reuse an existing session only after checking its admin profile. ===
// This function restores an active admin session automatically when a valid staff user is already signed in.
async function checkLoginState() {
  const {
    data: { session },
    error,
  } = await db.auth.getSession();

  if (error || !session) {
    showLogin();
    return;
  }

  const user = session.user;

  const { data: profile, error: profileError } = await db
    .from("admin_profiles")
    .select("admin_id, name, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    await db.auth.signOut();
    showLogin();
    return;
  }

  if (profile.role !== "admin") {
    await db.auth.signOut();
    showLogin();
    return;
  }

  showDashboard();
  setActiveSection("dashboard");

  startVisitorAutoRefresh();
}

// === ADMIN INITIALIZATION: Restore session state and register all dashboard event handlers. ===
// This startup function wires together the admin page, loads the current library hours, and attaches all interactive controls.
async function initAdmin() {
  updateHeaderMeta();
  loadLibraryHours();
  loadSuggestions();

  // Check if admin is already logged in
  await checkLoginState();

  // =========================
  // SIDEBAR NAVIGATION
  // =========================
  navItems.forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.section;

      if (section) {
        setActiveSection(section);
      }
    });
  });

  // =========================
  // MOBILE SIDEBAR
  // =========================
  mobileSidebarToggle?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
  });

  // =========================
  // FILTERS
  // =========================
  programFilter?.addEventListener("change", () => {
    currentPage = 1;
    renderTable();
  });

  purposeFilter?.addEventListener("change", () => {
    currentPage = 1;
    renderTable();
  });

  dateFilter?.addEventListener("change", () => {
    currentPage = 1;
    renderTable();
  });

  searchInput?.addEventListener("input", () => {
    currentPage = 1;
    renderTable();
  });

  // =========================
  // PAGINATION
  // =========================
  prevPageBtn?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  nextPageBtn?.addEventListener("click", () => {
    const totalPages = Math.max(
      1,
      Math.ceil(getFilteredRecords().length / pageSize),
    );

    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
    }
  });

  // =========================
  // EXPORT CSV
  // =========================
  exportCsvBtn?.addEventListener("click", exportCsv);

  // =========================
  // REPORTS
  // =========================
  reportPeriodSelect?.addEventListener("change", handleReportPeriodChange);

  reportStartDate?.addEventListener("change", updateReports);
  reportEndDate?.addEventListener("change", updateReports);
  saveLibraryHoursBtn?.addEventListener("click", saveLibraryHours);
}

// =========================
// LOGIN
// =========================
loginForm?.addEventListener("submit", handleLogin);

// =========================
// LOGOUT
// =========================
logoutBtn?.addEventListener("click", handleLogout);

// =========================
// BACK TO STUDENT PAGE
// =========================
backToStudentBtn?.addEventListener("click", () => {
  window.location.href = "index.php";
});

// =========================
// START ADMIN
// =========================
initAdmin();
