<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- === PAGE METADATA: Define the staff page title, description, fonts, icons, and styles. === -->
    <title>SSU Staff Portal</title>
    <meta
      name="description"
      content="SSU Library staff portal dashboard prototype."
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
    <link rel="stylesheet" href="css/admin.css" />
  </head>
  <body class="admin-body">
    <!-- === LOGIN VIEW: Collect staff credentials before showing protected dashboard data. === -->
    <!-- This is the first screen an administrator sees when the staff portal is opened. -->
    <div class="admin-login-screen" id="adminLoginScreen">
      <div class="login-card">
        <button class="back-link text-link" id="backToStudent" type="button">
          <i class="fa-solid fa-arrow-left"></i> Back to student logbook
        </button>

        <div class="login-header">
          <span class="small-label">STAFF ACCESS ONLY</span>
          <h1>Welcome back</h1>
          <p>Log in to view the Library Room Logbook.</p>
        </div>

        <form id="adminLoginForm" novalidate>
          <!-- The staff login form verifies the administrator account before exposing the analytics dashboard. -->
          <div class="field-group">
            <label for="adminEmail">Admin Email</label>

            <input
              id="adminEmail"
              name="adminEmail"
              type="email"
              placeholder="Enter admin email"
              autocomplete="email"
              required
            />
          </div>

          <div class="field-group">
            <label for="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              autocomplete="current-password"
              required
            />
          </div>

          <p class="login-error" id="loginError"></p>

          <button type="submit" class="primary-btn full-width">
            Login <i class="fa-solid fa-arrow-right"></i>
          </button>
        </form>
      </div>
    </div>

    <!-- === DASHBOARD VIEW: Contains staff navigation, header metadata, and dashboard panels. === -->
    <div class="dashboard-shell hidden" id="adminDashboardShell">
      <!-- The sidebar helps staff move between dashboard views without leaving the protected admin area. -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <div class="brand-mark">SSU</div>
          <div>
            <p>SSU Library</p>
            <span>STAFF PORTAL</span>
          </div>
        </div>

        <nav class="sidebar-nav" aria-label="Admin navigation">
          <button
            class="nav-item active"
            data-section="dashboard"
            type="button"
          >
            <i class="fa-solid fa-table-columns"></i>
            <span>Dashboard</span>
          </button>
          <button class="nav-item" data-section="logs" type="button">
            <i class="fa-solid fa-clipboard-list"></i>
            <span>Visitor Logs</span>
          </button>
          <button class="nav-item" data-section="reports" type="button">
            <i class="fa-solid fa-chart-pie"></i>
            <span>Reports</span>
          </button>
          <button class="nav-item" data-section="suggestions" type="button">
            <i class="fa-regular fa-message"></i>
            <span>Suggestions</span>
          </button>
        </nav>

        <div class="sidebar-bottom">
          <button
            class="nav-item profile-link"
            data-section="profile"
            type="button"
          >
            <i class="fa-solid fa-user"></i>
            <span>My Profile</span>
          </button>
          <button class="nav-item logout-link" id="logoutBtn" type="button">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div class="content-panel">
        <header class="admin-header">
          <div class="mobile-toggle-wrap">
            <button
              class="mobile-sidebar-toggle"
              id="mobileSidebarToggle"
              type="button"
              aria-label="Toggle sidebar"
            >
              <i class="fa-solid fa-bars"></i>
            </button>
          </div>
          <div>
            <span class="small-label admin-small-label"
              >LIBRARY ROOM LOGBOOK</span
            >
            <h2 id="adminGreeting">Good morning, Library Administrator</h2>
          </div>
          <div class="header-date" id="adminCurrentDate">September 8, 2026</div>
        </header>

        <main class="admin-main">
          <!-- === DASHBOARD PANEL: Show current statistics, hourly activity, and program counts. === -->
          <!-- This dashboard gives the administrator a quick summary of major library entrance trends for the day. -->
          <section
            class="admin-section active"
            id="dashboardSection"
            data-panel="dashboard"
          >
            <div class="stats-grid">
              <article class="stat-card blue">
                <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
                <div class="stat-copy">
                  <span>Today's Visitors</span>
                  <strong id="statTodayVisitors">0</strong>
                  <small id="statTodayTrend">+0% from yesterday</small>
                </div>
              </article>

              <article class="stat-card green">
                <div class="stat-icon">
                  <i class="fa-solid fa-circle-check"></i>
                </div>
                <div class="stat-copy">
                  <span>Currently Logged Visitors</span>
                  <strong id="statLoggedVisitors">0</strong>
                  <small>Live attendance</small>
                </div>
              </article>

              <article class="stat-card purple">
                <div class="stat-icon">
                  <i class="fa-solid fa-book-open"></i>
                </div>
                <div class="stat-copy">
                  <span>Today's Study Visits</span>
                  <strong id="statStudyVisits">0</strong>
                  <small>Academic use</small>
                </div>
              </article>

              <article class="stat-card orange">
                <div class="stat-icon"><i class="fa-solid fa-book"></i></div>
                <div class="stat-copy">
                  <span>Borrow Book Visits</span>
                  <strong id="statBorrowVisits">0</strong>
                  <small>Circulation desk</small>
                </div>
              </article>
            </div>

            <div class="card-grid">
              <article class="content-card chart-card">
                <div class="card-header-row">
                  <div>
                    <h3>Today's visitor activity</h3>
                    <p>Library room visitors by hour</p>
                  </div>
                  <button class="text-link" type="button">
                    View all logs <i class="fa-solid fa-arrow-right"></i>
                  </button>
                </div>

                <div
                  class="chart"
                  id="activityChart"
                  aria-label="Visitor activity chart"
                ></div>
              </article>

              <article class="content-card program-card">
                <div class="card-header-row">
                  <div>
                    <h3>Visitors by Program</h3>
                  </div>
                </div>
                <div class="program-list" id="programBreakdown"></div>
              </article>
            </div>
          </section>

          <!-- === LOGS PANEL: Search, filter, paginate, and export visitor records. === -->
          <!-- The logs page is the main record table where staff can review each visitor entry and export data. -->
          <section class="admin-section" id="logsSection" data-panel="logs">
            <div class="section-header-row">
              <div>
                <h3>Visitor Logs</h3>
                <p>Newest visitor records appear first.</p>
              </div>
              <button
                class="secondary-btn small-btn"
                id="exportCsvBtn"
                type="button"
              >
                <i class="fa-solid fa-download"></i> Export CSV
              </button>
            </div>

            <div class="filter-panel">
              <div class="search-box">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input
                  id="searchInput"
                  type="search"
                  placeholder="Search visitor name"
                />
              </div>

              <div class="filter-row">
                <select id="programFilter">
                  <option value="All Programs">All Programs</option>
                  <option>BS Information Technology</option>
                  <option>BS Computer Science</option>
                  <option>BS Education</option>
                  <option>BS Psychology</option>
                  <option>Other</option>
                </select>

                <select id="purposeFilter">
                  <option value="All Purposes">All Purposes</option>
                  <option>Study</option>
                  <option>Borrow Book</option>
                </select>

                <select id="dateFilter">
                  <option value="All Dates">All Dates</option>
                  <option value="Today">Today</option>
                  <option value="Yesterday">Yesterday</option>
                </select>
              </div>
            </div>

            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>STUDENT NAME</th>
                    <th>PROGRAM / COURSE</th>
                    <th>YEAR LEVEL</th>
                    <th>PURPOSE</th>
                    <th>DATE</th>
                    <th>TIME</th>
                  </tr>
                </thead>
                <tbody id="logsTableBody"></tbody>
              </table>
            </div>

            <div class="pagination-row">
              <div class="page-summary" id="pageSummary">
                Showing 0-0 of 0 logs
              </div>
              <div class="pagination-controls">
                <button type="button" id="prevPageBtn">Previous</button>
                <div id="pageNumbers" class="page-numbers"></div>
                <button type="button" id="nextPageBtn">Next</button>
              </div>
            </div>
          </section>

          <!-- === REPORTS PANEL: Summarize attendance for a selected time period. === -->
          <!-- Reports convert raw attendance records into simple totals for library planning and review. -->
          <section
            class="admin-section"
            id="reportsSection"
            data-panel="reports"
          >
            <div class="section-header-row">
              <div>
                <h3>Visitor Reports</h3>
                <p>Review library room attendance by time period.</p>
              </div>
            </div>

            <div class="report-controls">
              <select id="reportPeriodSelect">
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Custom Date">Custom Date</option>
              </select>

              <div class="custom-date-group hidden" id="customDateGroup">
                <input type="date" id="reportStartDate" />
                <input type="date" id="reportEndDate" />
              </div>
            </div>

            <div class="stats-grid report-grid">
              <article class="stat-card blue report-card">
                <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
                <div class="stat-copy">
                  <span>Total Visitors</span>
                  <strong id="reportTotalVisitors">0</strong>
                  <small>Selected period</small>
                </div>
              </article>

              <article class="stat-card purple report-card">
                <div class="stat-icon">
                  <i class="fa-solid fa-book-open"></i>
                </div>
                <div class="stat-copy">
                  <span>Study Visits</span>
                  <strong id="reportStudyVisits">0</strong>
                  <small>Academic use</small>
                </div>
              </article>

              <article class="stat-card orange report-card">
                <div class="stat-icon"><i class="fa-solid fa-book"></i></div>
                <div class="stat-copy">
                  <span>Borrow Book Visits</span>
                  <strong id="reportBorrowVisits">0</strong>
                  <small>Circulation desk</small>
                </div>
              </article>
            </div>
          </section>

          <!-- === SUGGESTIONS PANEL: Review feedback from users and library visitors. === -->
          <section
            class="admin-section"
            id="suggestionsSection"
            data-panel="suggestions"
          >
            <div class="section-header-row">
              <div>
                <h3>Comments &amp; Suggestions</h3>
                <p>Recent visitor feedback and improvement requests.</p>
              </div>
            </div>

            <div class="suggestions-list" id="suggestionsList">
              <div class="empty-state">No suggestions submitted yet.</div>
            </div>
          </section>

          <!-- === PROFILE PANEL: Display the configured administrator account details. === -->
          <section
            class="admin-section"
            id="profileSection"
            data-panel="profile"
          >
            <div class="profile-card">
              <div class="profile-avatar">L</div>
              <h3>Library Administrator</h3>
              <a href="mailto:staff@ssu.edu.ph">staff@ssu.edu.ph</a>
              <div class="profile-role">Administrator</div>
              <div class="status-pill">ACTIVE</div>

              <!-- === LIBRARY HOURS: Let an authenticated administrator control student check-in availability. === -->
              <div class="library-hours-panel">
                <h4>Library Hours</h4>
                <p>These hours control the student check-in button.</p>
                <div class="library-hours-fields">
                  <label>
                    Opens
                    <input type="time" id="libraryOpenTime" value="06:00" />
                  </label>
                  <label>
                    Closes
                    <input type="time" id="libraryCloseTime" value="16:00" />
                  </label>
                </div>
                <button class="primary-btn" id="saveLibraryHoursBtn" type="button">
                  Save Library Hours
                </button>
                <p class="library-hours-message" id="libraryHoursMessage" aria-live="polite"></p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>

    <!-- === CLIENT SCRIPTS: Load shared Supabase setup before the admin dashboard behavior. === -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="js/supabase.js"></script>
    <script src="js/admin.js?v=3"></script>
  </body>
</html>
