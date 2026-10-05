const visitorFormShell = document.querySelector('.form-panel-shell');
const openVisitorBtn = document.getElementById('openVisitorForm');
const closeVisitorBtn = document.getElementById('closeVisitorForm');
const visitorForm = document.getElementById('visitorForm');
const nameInput = document.getElementById('studentName');
const programInput = document.getElementById('programSelect');
const yearInput = document.getElementById('yearSelect');
const purposeHidden = document.getElementById('purposeValue');
const timestampDisplay = document.getElementById('timestampDisplay');
const doneSuccessBtn = document.getElementById('doneSuccess');

const summaryName = document.getElementById('summaryName');
const summaryProgram = document.getElementById('summaryProgram');
const summaryYear = document.getElementById('summaryYear');
const summaryPurpose = document.getElementById('summaryPurpose');
const summaryDate = document.getElementById('summaryDate');
const summaryTime = document.getElementById('summaryTime');

const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');
const libraryStatus = document.getElementById('libraryStatus');
const libraryStatusLabel = document.getElementById('libraryStatusLabel');
const libraryStatusDetail = document.getElementById('libraryStatusDetail');
const liveBadge = document.getElementById('liveBadge');
const liveBadgeLabel = document.getElementById('liveBadgeLabel');
const footerSuggestionForm = document.getElementById('footerSuggestionForm');
const footerSuggestionMessage = document.getElementById('footerSuggestionMessage');
const footerSuggestionStatus = document.getElementById('footerSuggestionStatus');

// === LIBRARY CONFIGURATION: Change these weekly hours to match the actual library schedule. ===
let librarySchedule = {
  0: null,
  1: { open: '06:00', close: '16:00' },
  2: { open: '06:00', close: '16:00' },
  3: { open: '06:00', close: '16:00' },
  4: { open: '06:00', close: '16:00' },
  5: { open: '06:00', close: '16:00' },
  6: { open: '06:00', close: '16:00' }
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let administratorOverride = false;
let administratorAccessToken = '';

// === TIME FORMATTING: Convert a Date into labels used by the clock and visitor confirmation. ===
function formatDateTime(date = new Date()) {
  const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true };

  return {
    dateLabel: date.toLocaleDateString('en-US', optionsDate),
    timeLabel: date.toLocaleTimeString('en-US', optionsTime)
  };
}

// === LIVE CLOCK: Update the visible time, date, and form timestamp. ===
function updateLiveClock() {
  const { dateLabel, timeLabel } = formatDateTime();
  const clock = document.getElementById('liveClock');
  const dateEl = document.getElementById('liveDate');

  if (clock) {
    clock.textContent = timeLabel;
  }

  if (dateEl) {
    dateEl.textContent = dateLabel;
  }

  if (timestampDisplay) {
    timestampDisplay.textContent = `${dateLabel} • ${timeLabel}`;
  }
}

// === CLOCK TIMER: Start the one-second interval that keeps the landing page current. ===
function startLiveClock() {
  updateLiveClock();
  updateLibraryStatus();
  setInterval(updateLiveClock, 1000);
  setInterval(refreshLibraryStatus, 30000);
}

// === LIBRARY HOURS: Convert configured clock values into minutes for reliable comparisons. ===
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatScheduleTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function getNextOpening(now, schedule) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todaySchedule = schedule[now.getDay()];

  if (todaySchedule && currentMinutes < timeToMinutes(todaySchedule.open)) {
    return {
      day: 'today',
      time: todaySchedule.open
    };
  }

  for (let daysAhead = 1; daysAhead <= 7; daysAhead += 1) {
    const nextDay = (now.getDay() + daysAhead) % 7;
    if (schedule[nextDay]) {
      return {
        day: DAY_NAMES[nextDay],
        time: schedule[nextDay].open
      };
    }
  }

  return null;
}

// === LIBRARY STATUS: Determine open/closed state and the message shown to visitors. ===
function getLibraryStatus(now = new Date()) {
  const schedule = librarySchedule[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (schedule) {
    const isOpen = currentMinutes >= timeToMinutes(schedule.open)
      && currentMinutes < timeToMinutes(schedule.close);

    if (isOpen) {
      return {
        isOpen: true,
        label: 'OPEN',
        detail: `Closes at ${formatScheduleTime(schedule.close)}`
      };
    }
  }

  const nextOpening = getNextOpening(now, librarySchedule);
  const nextLabel = nextOpening.day === 'today'
    ? `today at ${formatScheduleTime(nextOpening.time)}`
    : `${nextOpening.day} at ${formatScheduleTime(nextOpening.time)}`;

  return {
    isOpen: false,
    label: 'CLOSED',
    detail: `Opens ${nextLabel}`
  };
}

function updateCheckInControls(status) {
  const canCheckIn = status.isOpen || administratorOverride;
  const submitButton = visitorForm?.querySelector('button[type="submit"]');

  if (openVisitorBtn) {
    openVisitorBtn.disabled = !canCheckIn;
    openVisitorBtn.setAttribute('aria-disabled', String(!canCheckIn));
    openVisitorBtn.title = canCheckIn
      ? ''
      : `Check-in is unavailable. ${status.detail}.`;
  }

  if (submitButton && !submitButton.disabled) {
    submitButton.disabled = !canCheckIn;
  }
}

function updateLibraryStatus() {
  const status = getLibraryStatus();
  const displayState = status.isOpen ? 'open' : 'closed';

  libraryStatus?.setAttribute('data-state', displayState);
  liveBadge?.setAttribute('data-state', displayState);
  if (liveBadgeLabel) {
    liveBadgeLabel.textContent = status.isOpen ? 'LIVE' : 'CLOSED';
  }
  if (libraryStatusLabel) {
    libraryStatusLabel.textContent = administratorOverride && !status.isOpen
      ? 'CLOSED - ADMIN OVERRIDE'
      : status.label;
  }
  if (libraryStatusDetail) {
    libraryStatusDetail.textContent = administratorOverride && !status.isOpen
      ? `Administrator check-in enabled. ${status.detail}.`
      : status.detail;
  }

  updateCheckInControls(status);
}

// === SCHEDULE SYNC: Fetch the current hours so admin changes reach students in real time. ===
async function refreshLibraryStatus() {
  try {
    const response = await fetch('api/library_status.php', {
      cache: 'no-store'
    });
    const data = await response.json();

    if (!response.ok || !data.success || !data.schedule) {
      throw new Error(data.message || 'Unable to load library hours.');
    }

    librarySchedule = data.schedule;
  } catch (error) {
    console.error('Unable to refresh library hours:', error);
  }

  updateLibraryStatus();
}

// === ADMIN OVERRIDE: Allow a verified Supabase administrator to check in after closing time. ===
async function loadAdministratorOverride() {
  administratorAccessToken = '';

  if (typeof db === 'undefined') {
    updateLibraryStatus();
    return;
  }

  try {
    const { data: { session }, error: sessionError } = await db.auth.getSession();
    if (sessionError || !session) {
      updateLibraryStatus();
      return;
    }

    administratorAccessToken = session.access_token;

    const { data: profile, error: profileError } = await db
      .from('admin_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    administratorOverride = !profileError && profile?.role === 'admin';
  } catch (error) {
    console.error('Unable to verify administrator status:', error);
    administratorOverride = false;
  }

  updateLibraryStatus();
}

// === FORM RESET: Clear visitor inputs and remove the selected purpose. ===
function resetFormState() {
  visitorForm.reset();
  purposeHidden.value = '';
  document.querySelectorAll('.purpose-card').forEach(card => card.classList.remove('selected'));
}

// === FORM VIEW: Replace the landing hero with the visitor entry form. ===
function showVisitorForm() {
  if (!visitorFormShell) return;
  document.body.classList.add('form-open');
  document.body.classList.remove('success-open');
  visitorFormShell.classList.add('form-open');
  visitorFormShell.classList.remove('success-open');
}

// === FORM VIEW: Close the visitor form and reset its visible state. ===
// === FORM CLOSE HANDLER: Reset the student form view and clear any form data when the user goes back. ===
// This keeps the landing page clean and ensures the next visitor starts with a fresh form state.
function hideVisitorForm() {
  if (!visitorFormShell) return;
  document.body.classList.remove('form-open', 'success-open');
  visitorFormShell.classList.remove('form-open', 'success-open');
  if (visitorForm) visitorForm.reset();
}

// === SUCCESS VIEW: Display the visit details after the API confirms the save. ===
// This function swaps the form view for a confirmation screen so the user sees the exact submitted record.
function showSuccessScreen(data) {
  if (!visitorFormShell) return;
  document.body.classList.remove('form-open');
  document.body.classList.add('success-open');
  visitorFormShell.classList.remove('form-open');
  visitorFormShell.classList.add('success-open');

  summaryName.textContent = data.name;
  summaryProgram.textContent = data.program;
  summaryYear.textContent = data.year;
  summaryPurpose.textContent = data.purpose;
  summaryDate.textContent = data.date;
  summaryTime.textContent = data.time;
}

// === SUCCESS VIEW: Return to the initial landing state after confirmation. ===
// The user finishes the flow here and is taken back to the homepage to start another visit if needed.
function hideSuccessScreen() {
  if (!visitorFormShell) return;
  document.body.classList.remove('form-open', 'success-open');
  visitorFormShell.classList.remove('form-open', 'success-open');
  resetFormState();
}

// === FORM VALIDATION: Require student identity, program, year, and visit purpose. ===
// This validation prevents incomplete records from being sent to the server and helps maintain clean data.
function validateForm() {
  const name = nameInput.value.trim();
  const program = programInput.value.trim();
  const year = yearInput.value.trim();
  const purpose = purposeHidden.value.trim();

  if (!name || !program || !year || !purpose) {
    return false;
  }

  return true;
}

// === PURPOSE SELECTION: Mark one purpose card and store its value in the hidden field. ===
// The UI uses button cards for a more user-friendly choice, but the real value is saved in a hidden input for form submission.
function handlePurposeSelection(event) {
  const selected = event.currentTarget;
  const purpose = selected.dataset.purpose;

  document.querySelectorAll('.purpose-card').forEach(card => {
    card.classList.toggle('selected', card === selected);
  });

  purposeHidden.value = purpose;
}

// === VISITOR SUBMISSION: Validate input, call the PHP endpoint, and show success details. ===
// This is the main action for students: it checks access, validates the form, saves the record, and then displays a confirmation message.
async function handleSubmit(event) {
  event.preventDefault();

  // === AVAILABILITY GUARD: Stop student submissions while preserving the admin bypass. ===
  const currentStatus = getLibraryStatus();
  if (!currentStatus.isOpen && !administratorOverride) {
    updateLibraryStatus();
    alert(`The library is currently closed. ${currentStatus.detail}.`);
    return;
  }

  // Validate the form first
  if (!validateForm()) {
    if (nameInput.value.trim() === '') {
      nameInput.focus();
    } else if (programInput.value.trim() === '') {
      programInput.focus();
    } else if (yearInput.value.trim() === '') {
      yearInput.focus();
    } else if (purposeHidden.value.trim() === '') {
      document.querySelector('.purpose-card')?.focus();
    }

    return;
  }

  // Get the current date and time
  const now = new Date();

  // Keep this format because showSuccessScreen()
  // already expects these property names.
  const record = {
    id: Date.now(),
    name: nameInput.value.trim(),
    program: programInput.value,
    year: yearInput.value,
    purpose: purposeHidden.value,

    date: now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),

    time: now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),

    createdAt: now.toISOString()
  };

// Disable the submit button while saving so the user does not trigger duplicate submissions during the network request.
  const submitButton = visitorForm.querySelector(
    'button[type="submit"]'
  );

  const originalButtonHTML = submitButton.innerHTML;

  submitButton.disabled = true;
  submitButton.innerHTML =
    'Saving... <i class="fa-solid fa-spinner fa-spin"></i>';

  try {

    // Send the JSON payload in a standard format and include the admin bearer token when the current user is an authorized administrator.
    const requestHeaders = {
      'Content-Type': 'application/json'
    };

    if (administratorAccessToken) {
      requestHeaders.Authorization = `Bearer ${administratorAccessToken}`;
    }

    const response = await fetch('api/visitor_logs.php', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        student_name: record.name,
        program: record.program,
        year_level: record.year,
        purpose: record.purpose
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Unable to save visitor record.');
    }

    console.log('Visitor successfully saved to Supabase.');

    // ==========================================
    // SHOW YOUR EXISTING SUCCESS SCREEN
    // ==========================================

    showSuccessScreen(record);

    // Reset form
    visitorForm.reset();
    purposeHidden.value = '';

    document
      .querySelectorAll('.purpose-card')
      .forEach(card => {
        card.classList.remove('selected');
      });

  } catch (error) {

    console.error('Unexpected error:', error);

    alert(
      'Something went wrong while recording your visit.'
    );

  } finally {

    // Restore button
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonHTML;

  }
}

// === MOBILE NAVIGATION: Toggle the responsive menu and close it after a link is chosen. ===
// On smaller screens, this makes the navigation usable without taking too much space on the page.
function setupMobileNav() {
  if (!mobileMenuToggle || !mainNav) return;

  mobileMenuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// === FOOTER SUGGESTIONS: Save user feedback from the public page to the suggestions API. ===
async function handleFooterSuggestionSubmit(event) {
  event.preventDefault();

  if (!footerSuggestionForm || !footerSuggestionMessage || !footerSuggestionStatus) {
    return;
  }

  const message = footerSuggestionMessage.value.trim();

  if (!message) {
    footerSuggestionStatus.textContent = 'Please enter a comment or suggestion.';
    footerSuggestionStatus.style.color = '#c63f3f';
    footerSuggestionMessage.focus();
    return;
  }

  footerSuggestionStatus.textContent = 'Sending your suggestion...';
  footerSuggestionStatus.style.color = '#1d9d72';

  try {
    const response = await fetch('api/suggestions.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to send your suggestion.');
    }

    footerSuggestionForm.reset();
    footerSuggestionStatus.textContent = 'Thank you for your suggestion!';
    footerSuggestionStatus.style.color = '#1d9d72';
  } catch (error) {
    footerSuggestionStatus.textContent = error.message || 'Unable to send your suggestion.';
    footerSuggestionStatus.style.color = '#c63f3f';
  }
}

// === LANDING INITIALIZATION: Attach student-page handlers only outside the admin page. ===
// This initializer ensures the student page setup only runs on the public library logbook and not on the protected staff area.
function initLandingPage() {
  if (!document.body.classList.contains('admin-body')) {
    startLiveClock();
    setupMobileNav();
    updateLibraryStatus();
    refreshLibraryStatus();
    loadAdministratorOverride();

    openVisitorBtn?.addEventListener('click', showVisitorForm);
    closeVisitorBtn?.addEventListener('click', hideVisitorForm);
    document.querySelectorAll('.purpose-card').forEach(card => {
      card.addEventListener('click', handlePurposeSelection);
    });
    visitorForm?.addEventListener('submit', handleSubmit);
    doneSuccessBtn?.addEventListener('click', hideSuccessScreen);
    footerSuggestionForm?.addEventListener('submit', handleFooterSuggestionSubmit);

    updateLiveClock();
  }
}

initLandingPage();