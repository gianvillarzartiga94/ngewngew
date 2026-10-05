<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- === PAGE METADATA: Define the browser tab title, search description, and shared styling resources for the student-facing page. === -->
    <title>SSU Library Room Logbook</title>
    <meta
      name="description"
      content="Online Library Room Logbook for Samar State University."
    />
    <!-- Load Google Fonts for the library branding and typography so the page looks more polished and readable. -->
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
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <!-- === SITE HEADER: Show branding and navigation to page sections and staff access. === -->
    <header class="site-header">
      <div class="container header-inner">
        <div class="brand" aria-label="SSU Library Brand">
          <div class="brand-mark">SSU</div>
          <div class="brand-copy">
            <h1>SSU Library</h1>
            <span>Room Logbook</span>
          </div>
        </div>

        <nav class="main-nav" aria-label="Main navigation">
          <!-- Each navigation link scrolls to a key section or opens the staff area for library management. -->
          <a href="#home">Home</a>
          <a href="#how-it-works">How It Works</a>
          <a href="admin.php" class="nav-portal"
            >Staff Portal <i class="fa-solid fa-arrow-right"></i
          ></a>
        </nav>

        <button
          class="mobile-menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded="false"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>

    <!-- === STUDENT PAGE: Contains the visit entry flow, clock, instructions, and footer. === -->
    <main class="page-shell" id="home">
      <!-- === HERO: Introduce the logbook and provide the button that opens the visitor form. === -->
      <section class="hero-section">
        <div class="container hero-inner">
          <div class="hero-copy">
            <span class="eyebrow">✓ DIGITAL VISITOR RECORD</span>
            <h2>
              Your library visit,<br />
              <span class="accent-italic">logged with ease.</span>
            </h2>
            <p>
              Welcome to the Online Library Room Logbook. Quickly record your
              visit without waiting in line or writing in a manual logbook.
            </p>
            <!-- This button triggers the visitor form so students can quickly submit their library check-in details. -->
            <button class="primary-btn" id="openVisitorForm" type="button">
              Log my visit <i class="fa-solid fa-arrow-right"></i>
            </button>
            <!-- The short note reassures the user that the check-in process is fast and lightweight. -->
            <div class="mini-note">
              <i class="fa-regular fa-clock"></i> Takes less than a minute
            </div>
          </div>

          <div class="clock-card" aria-live="polite">
            <div class="clock-header">
              <span class="clock-icon"
                ><i class="fa-solid fa-book-open-reader"></i
              ></span>
              <span>LIBRARY ROOM</span>
              <span class="live-badge" id="liveBadge" data-state="closed"><span class="dot"></span> <span id="liveBadgeLabel">CLOSED</span></span>
            </div>
            <!-- === LIBRARY STATUS: Show whether check-in is available and the next schedule. === -->
            <div class="library-status" id="libraryStatus" data-state="closed">
              <div class="library-status-heading">
                <span class="status-indicator" aria-hidden="true"></span>
                <strong id="libraryStatusLabel">Checking status...</strong>
              </div>
              <span id="libraryStatusDetail">Checking library hours...</span>
            </div>
            <div class="clock-time" id="liveClock">10:42 AM</div>
            <div class="clock-date" id="liveDate">
              Tuesday, September 8, 2026
            </div>
            <p>Your visit is recorded securely and automatically.</p>
          </div>
        </div>
      </section>

      <!-- === VISITOR FORM: Collect student details and the purpose of the library visit. === -->
      <section class="visitor-form-wrapper">
        <div class="container form-panel-shell" id="visitorFormShell">
          <div class="visitor-form-panel" id="visitorFormPanel">
            <button class="back-link" id="closeVisitorForm" type="button">
              <i class="fa-solid fa-arrow-left"></i> Back
            </button>

            <div class="form-header">
              <span class="small-label">LIBRARY ROOM LOGBOOK</span>
              <h3>Log your visit</h3>
              <p>Please enter your information before you proceed.</p>
            </div>

            <form id="visitorForm" novalidate>
              <!-- The visitor form collects the basic details needed to document the check-in record. -->
              <div class="field-group">
                <label for="studentName">Student Name</label>
                <input
                  id="studentName"
                  name="studentName"
                  type="text"
                  placeholder="Enter your full name" required
                />
              </div>

              <div class="field-row">
                <div class="field-group">
                  <label for="programSelect">Program / Course</label>
                  <select id="programSelect" name="program">
                    <option value="">Select program</option>
                    <option>BS Information Technology</option>
                    <option>BS Computer Science</option>
                    <option>BS Education</option>
                    <option>BS Psychology</option>
                    <option>Other</option>
                  </select>
                </div>

                <div class="field-group">
                  <label for="yearSelect">Student Year</label>
                  <select id="yearSelect" name="year">
                    <option value="">Select year</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>5th Year</option>
                    <option>Graduate</option>
                  </select>
                </div>
              </div>

              <div class="purpose-block">
                <h4>What is the purpose of your visit?</h4>
                <!-- The purpose options tell the library how the student is using the room for reporting and attendance summaries. -->
                <div class="purpose-grid">
                  <button
                    class="purpose-card"
                    type="button"
                    data-purpose="Study"
                  >
                    <span class="purpose-icon"
                      ><i class="fa-solid fa-book-open"></i
                    ></span>
                    <span class="purpose-title">Study</span>
                    <span class="purpose-copy"
                      >Use the library for studying</span
                    >
                  </button>

                  <button
                    class="purpose-card"
                    type="button"
                    data-purpose="Borrow Book"
                  >
                    <span class="purpose-icon"
                      ><i class="fa-solid fa-book"></i
                    ></span>
                    <span class="purpose-title">Borrow Book</span>
                    <span class="purpose-copy"
                      >Visit for a book borrowing request</span
                    >
                  </button>
                </div>
                <input
                  type="hidden"
                  id="purposeValue"
                  name="purpose"
                  value=""
                />
              </div>

              <div class="timestamp-card" aria-live="polite">
                <div class="timestamp-top">
                  <span class="timestamp-icon"
                    ><i class="fa-regular fa-calendar"></i
                  ></span>
                  <span>Date &amp; Time</span>
                </div>
                <div class="timestamp-body" id="timestampDisplay">
                  Loading date and time...
                </div>
              </div>

              <div class="form-footer">
                <button class="primary-btn" type="submit">
                  Continue <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </form>
          </div>

          <!-- === SUCCESS SCREEN: Confirm the saved visit and display its submitted details. === -->
          <div class="success-screen" id="successScreen" aria-live="polite">
            <div class="checkmark-wrap">
              <div class="checkmark-circle">
                <i class="fa-solid fa-check"></i>
              </div>
            </div>
            <p class="success-tag">VISIT RECORDED</p>
            <h3>Visit successfully logged!</h3>
            <p class="success-text">
              Your library visit has been recorded. Thank you for logging your
              visit.
            </p>

            <div class="summary-card">
              <div class="summary-row">
                <span>Student Name</span><strong id="summaryName">-</strong>
              </div>
              <div class="summary-row">
                <span>Program</span><strong id="summaryProgram">-</strong>
              </div>
              <div class="summary-row">
                <span>Year Level</span><strong id="summaryYear">-</strong>
              </div>
              <div class="summary-row">
                <span>Purpose</span><strong id="summaryPurpose">-</strong>
              </div>
              <div class="summary-row">
                <span>Date</span><strong id="summaryDate">-</strong>
              </div>
              <div class="summary-row">
                <span>Time</span><strong id="summaryTime">-</strong>
              </div>
            </div>

            <button class="secondary-btn" id="doneSuccess" type="button">
              Done <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- === HOW IT WORKS: Explain the three steps of the student logging workflow. === -->
      <section class="how-it-works" id="how-it-works">
        <div class="container">
          <div class="section-heading narrow">
            <span class="eyebrow dark">SIMPLE FROM START TO FINISH</span>
            <h3>Just three quick steps</h3>
          </div>

          <div class="steps-grid">
            <article class="step-card">
              <span class="step-number">01</span>
              <h4>Enter your details</h4>
              <p>Tell us your name and program.</p>
            </article>

            <article class="step-card">
              <span class="step-number">02</span>
              <h4>Choose a purpose</h4>
              <p>Select Study or Borrow Book.</p>
            </article>

            <article class="step-card">
              <span class="step-number">03</span>
              <h4>Visit recorded</h4>
              <p>Your date and time are saved automatically.</p>
            </article>
          </div>
        </div>
      </section>
    </main>

    <!-- === FOOTER: Display contact information, library details, and a quick suggestions form. === -->
    <footer class="site-footer" id="footer-suggestions">
      <div class="container footer-grid">
        <div class="footer-column">
          <h4>Contact</h4>
          <ul>
            <li>SSU Library Services</li>
            <li>library@ssu.edu.ph</li>
            <li>+63 912 345 6789</li>
          </ul>
        </div>

        <div class="footer-column">
          <h4>About Us</h4>
          <p>
            The SSU Library Room Logbook helps students record visits quickly and
            allows staff to monitor usage and improve library services.
          </p>
        </div>

        <div class="footer-column">
          <h4>Comments &amp; Suggestions</h4>
          <form id="footerSuggestionForm" class="footer-suggestion-form" novalidate>
            <textarea
              id="footerSuggestionMessage"
              rows="3"
              placeholder="Share your comments or suggestions..."
              required
            ></textarea>
            <button type="submit" class="primary-btn small-btn">Send</button>
          </form>
          <p class="footer-form-status" id="footerSuggestionStatus" aria-live="polite"></p>
        </div>
      </div>

      <div class="container footer-bottom">
        <div class="footer-brand">SSU Library Room Logbook</div>
        <a href="admin.php">Staff / Admin Login</a>
      </div>
    </footer>

    <!-- === CLIENT SCRIPTS: Load shared Supabase setup before the student page behavior. === -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="js/supabase.js"></script>
    <script src="js/app.js?v=4"></script>
  </body>
</html>
