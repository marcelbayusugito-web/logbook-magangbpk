const loginScreen = document.getElementById('login-screen');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const authMessage = document.getElementById('auth-message');
const toast = document.getElementById('toast');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const signupName = document.getElementById('signup-name');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupConfirmPassword = document.getElementById('signup-confirm-password');
const toggleLoginPassword = document.getElementById('toggle-login-password');
const toggleSignupPassword = document.getElementById('toggle-signup-password');
const toggleSignupConfirmPassword = document.getElementById('toggle-signup-confirm-password');
const logoutButton = document.getElementById('logout-button');
const userNameDisplay = document.getElementById('user-name-display');
const form = document.getElementById('logbook-form');
const historyBody = document.getElementById('history-body');
const summaryDays = document.getElementById('summary-days');
const summaryTasks = document.getElementById('summary-tasks');
const summaryHours = document.getElementById('summary-hours');
const summaryComplete = document.getElementById('summary-complete');
const summaryIncomplete = document.getElementById('summary-incomplete');
const summaryFailed = document.getElementById('summary-failed');
const historyStatusFilter = document.getElementById('history-status-filter');
const historyProgressFilter = document.getElementById('history-progress-filter');
const historyDateFrom = document.getElementById('history-date-from');
const historyDateTo = document.getElementById('history-date-to');
const historySearch = document.getElementById('history-search');
const historyResetButton = document.getElementById('history-reset-filters');
const saveMessage = document.getElementById('save-message');
const historyDetail = document.getElementById('history-detail');
const detailTanggal = document.getElementById('detail-tanggal');
const detailUnit = document.getElementById('detail-unit');
const detailJam = document.getElementById('detail-jam');
const detailStatus = document.getElementById('detail-status');
const detailProgress = document.getElementById('detail-progress');
const detailKegiatan = document.getElementById('detail-kegiatan');
const detailHasil = document.getElementById('detail-hasil');
const detailKendala = document.getElementById('detail-kendala');
const detailEditButton = document.getElementById('edit-detail');
const detailCloseButton = document.getElementById('close-detail');

const state = {
  entries: [],
  selectedIndex: null,
  currentUser: null,
  profile: {
    name: 'Nama Peserta',
    id: '123456789',
    university: 'Universitas Negeri',
    study: 'Akuntansi / Hukum',
    period: 'Juni - Agustus 2026',
    mentor: 'Nama Pembimbing',
    email: 'peserta@email.com',
  },
};
const authUsersKey = 'mockLogbookUsers';
const currentUserKey = 'mockLogbookCurrentUser';

function parseTimeRange(value) {
  if (!value) return { text: '-', duration: 0 };

  const cleaned = value.trim().replace(/\s+/g, ' ');
  const parts = cleaned.split(/\s*-\s*/);
  if (parts.length !== 2) return { text: cleaned, duration: 0 };

  const parseTime = (text) => {
    const match = text.match(/^(\d{1,2})[:.](\d{2})$/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes >= 60) return null;
    return hours + minutes / 60;
  };

  const start = parseTime(parts[0]);
  const end = parseTime(parts[1]);
  if (start === null || end === null || end <= start) {
    return { text: cleaned, duration: 0 };
  }

  const duration = Math.round((end - start) * 100) / 100;
  return { text: `${parts[0]} - ${parts[1]}`, duration };
}

function getEntryDuration(entry) {
  if (typeof entry.jamDuration === 'number') {
    return entry.jamDuration;
  }

  if (entry.jam) {
    return parseTimeRange(entry.jam).duration;
  }

  return 0;
}

function saveState() {
  localStorage.setItem('logbookState', JSON.stringify({
    entries: state.entries,
    profile: state.profile,
  }));
}

function loadState() {
  const saved = localStorage.getItem('logbookState');
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    state.entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    state.profile = parsed.profile || state.profile;
  } catch (error) {
    console.warn('Gagal memuat data logbook dari penyimpanan:', error);
  }
}

function saveAuthState() {
  const users = JSON.parse(localStorage.getItem(authUsersKey) || '[]');
  localStorage.setItem(authUsersKey, JSON.stringify(users));
}

function loadAuthState() {
  const savedUser = localStorage.getItem(currentUserKey);
  if (!savedUser) return;

  try {
    state.currentUser = JSON.parse(savedUser);
  } catch (error) {
    console.warn('Gagal memuat user dari penyimpanan:', error);
  }
}

function setCurrentUser(user) {
  state.currentUser = user;
  localStorage.setItem(currentUserKey, JSON.stringify(user));
  userNameDisplay.textContent = user ? user.name : 'Tamu';
  if (user) {
    logoutButton.classList.remove('hidden');
  } else {
    logoutButton.classList.add('hidden');
  }
}

let toastTimeout = null;

function showAuthMessage(message, isError = false) {
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.classList.remove('hidden');
  authMessage.style.borderColor = isError ? '#fecaca' : '#c7d2fe';
  authMessage.style.background = isError ? '#fee2e2' : '#eff6ff';
  authMessage.style.color = isError ? '#991b1b' : '#1e3a8a';
}

function showToast(message, duration = 2500) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

function clearAuthMessage() {
  if (!authMessage) return;
  authMessage.textContent = '';
  authMessage.classList.add('hidden');
}

function triggerLogoPulse() {
  document.querySelectorAll('.brand-mark').forEach((mark) => {
    mark.classList.add('pulse');
    mark.addEventListener('animationend', () => {
      mark.classList.remove('pulse');
    }, { once: true });
  });
}

function showMainApp() {
  if (loginScreen) {
    loginScreen.classList.add('login-screen-hidden');
    loginScreen.classList.remove('login-screen-visible');
  }
  if (state.currentUser) {
    userNameDisplay.textContent = state.currentUser.name;
    logoutButton.classList.remove('hidden');
  }
  triggerLogoPulse();
  renderHistory();
  updateSummary();
  renderProfile();
  renderHistoryDetail();
}

function showLoginScreen() {
  if (loginScreen) {
    loginScreen.classList.remove('login-screen-hidden');
    loginScreen.classList.add('login-screen-visible');
  }
  logoutButton.classList.add('hidden');
  userNameDisplay.textContent = 'Tamu';
}

function togglePasswordVisibility(input, toggleButton) {
  if (!input || !toggleButton) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  toggleButton.textContent = isPassword ? '🙈' : '👁';
  toggleButton.setAttribute('aria-label', isPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
}

function switchAuthTab(isSignup) {
  if (isSignup) {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    loginTab.classList.remove('active');
    signupTab.classList.add('active');
  } else {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    signupTab.classList.remove('active');
    loginTab.classList.add('active');
  }
}

function getAuthUsers() {
  try {
    return JSON.parse(localStorage.getItem(authUsersKey) || '[]');
  } catch {
    return [];
  }
}

function saveAuthUser(user) {
  const users = getAuthUsers();
  users.push(user);
  localStorage.setItem(authUsersKey, JSON.stringify(users));
}

function findAuthUser(email) {
  return getAuthUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function isValidEmail(email) {
  return /^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(email);
}

function handleLogin(event) {
  event.preventDefault();
  clearAuthMessage();

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    showAuthMessage('Email dan kata sandi wajib diisi.', true);
    return;
  }

  if (!isValidEmail(email)) {
    showAuthMessage('Format email tidak valid.', true);
    return;
  }

  const user = findAuthUser(email);
  if (!user || user.password !== password) {
    showAuthMessage('Email atau kata sandi tidak valid.', true);
    return;
  }

  setCurrentUser({ name: user.name, email: user.email });
  showMainApp();
  showToast(`Berhasil masuk sebagai ${user.name}`);
}

function handleSignup(event) {
  event.preventDefault();
  clearAuthMessage();

  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();
  const confirmPassword = signupConfirmPassword.value.trim();

  if (!name || !email || !password || !confirmPassword) {
    showAuthMessage('Semua kolom pendaftaran wajib diisi.', true);
    return;
  }

  if (!isValidEmail(email)) {
    showAuthMessage('Format email tidak valid.', true);
    return;
  }

  if (password.length < 6) {
    showAuthMessage('Kata sandi harus minimal 6 karakter.', true);
    return;
  }

  if (password !== confirmPassword) {
    showAuthMessage('Kata sandi dan konfirmasi tidak cocok.', true);
    return;
  }

  if (findAuthUser(email)) {
    showAuthMessage('Email sudah terdaftar. Silakan masuk.', true);
    return;
  }

  saveAuthUser({ name, email, password });
  setCurrentUser({ name, email });
  showMainApp();
  showToast(`Selamat datang, ${name}!`);
  showAuthMessage('Akun berhasil dibuat. Selamat datang!', false);
}

function handleLogout() {
  localStorage.removeItem(currentUserKey);
  state.currentUser = null;
  showLoginScreen();
}

function updateSummary() {
  const days = new Set(state.entries.map((entry) => entry.tanggal)).size;
  const tasks = state.entries.length;
  const hours = state.entries.reduce((sum, entry) => sum + getEntryDuration(entry), 0);
  const complete = state.entries.filter((entry) => entry.progress === 'Selesai').length;
  const incomplete = state.entries.filter((entry) => entry.progress === 'Belum selesai').length;
  const failed = state.entries.filter((entry) => entry.progress === 'Tidak selesai').length;

  summaryDays.textContent = days;
  summaryTasks.textContent = tasks;
  summaryHours.textContent = `${hours.toFixed(2)} jam`;
  summaryComplete.textContent = complete;
  summaryIncomplete.textContent = incomplete;
  summaryFailed.textContent = failed;

  // Show/hide empty state
  const dashboardEmptyState = document.getElementById('dashboard-empty-state');
  const cardsGrid = document.querySelector('.cards-grid');
  if (tasks === 0) {
    cardsGrid.classList.add('hidden');
    dashboardEmptyState.classList.remove('hidden');
  } else {
    cardsGrid.classList.remove('hidden');
    dashboardEmptyState.classList.add('hidden');
  }
}

function renderHistory() {
  const statusFilter = historyStatusFilter ? historyStatusFilter.value : 'all';
  const progressFilter = historyProgressFilter ? historyProgressFilter.value : 'all';
  const dateFrom = historyDateFrom ? historyDateFrom.value : '';
  const dateTo = historyDateTo ? historyDateTo.value : '';
  const searchValue = historySearch ? historySearch.value.toLowerCase().trim() : '';

  const filteredEntries = state.entries.filter((entry) => {
    const matchStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchProgress = progressFilter === 'all' || entry.progress === progressFilter;
    const matchDateFrom = !dateFrom || entry.tanggal >= dateFrom;
    const matchDateTo = !dateTo || entry.tanggal <= dateTo;
    const textMatch = searchValue === '' || [
      entry.kegiatan,
      entry.hasil,
      entry.kendala,
      entry.unit,
    ].some((field) => field && field.toLowerCase().includes(searchValue));
    return matchStatus && matchProgress && matchDateFrom && matchDateTo && textMatch;
  });

  const historyEmptyState = document.getElementById('history-empty-state');
  const historyTable = document.getElementById('history-table');

  if (filteredEntries.length === 0) {
    historyBody.innerHTML = '';
    historyTable.classList.add('hidden');
    historyEmptyState.classList.remove('hidden');
    historyDetail.classList.add('hidden');
    return;
  }

  historyTable.classList.remove('hidden');
  historyEmptyState.classList.add('hidden');

  historyBody.innerHTML = filteredEntries
    .slice()
    .reverse()
    .map((entry) => {
      const originalIndex = state.entries.indexOf(entry);
      return `<tr>
        <td>${entry.tanggal}</td>
        <td>${entry.unit}</td>
        <td>${entry.kegiatan}</td>
        <td>${entry.status}</td>
        <td>${renderBadge(entry.progress)}</td>
        <td class="actions-cell">
          <button type="button" class="button button-secondary small view-button" data-index="${originalIndex}">Lihat</button>
          <button type="button" class="button button-danger small delete-button" data-index="${originalIndex}">Hapus</button>
        </td>
      </tr>`;
    })
    .join('');
}

function renderBadge(progress) {
  if (!progress) return '-';
  const normalized = progress.toLowerCase();
  if (normalized === 'selesai') {
    return `<span class="badge-status badge-complete">${progress}</span>`;
  }
  if (normalized === 'belum selesai') {
    return `<span class="badge-status badge-incomplete">${progress}</span>`;
  }
  if (normalized === 'tidak selesai') {
    return `<span class="badge-status badge-failed">${progress}</span>`;
  }
  return `<span class="badge-status">${progress}</span>`;
}

function renderHistoryDetail() {
  if (state.selectedIndex === null || !state.entries[state.selectedIndex]) {
    historyDetail.classList.add('hidden');
    return;
  }

  const entry = state.entries[state.selectedIndex];
  detailTanggal.textContent = entry.tanggal;
  detailUnit.textContent = entry.unit;
  detailJam.textContent = entry.jam;
  detailStatus.textContent = entry.status;
  detailProgress.textContent = entry.progress || '-';
  detailKegiatan.textContent = entry.kegiatan;
  detailHasil.textContent = entry.hasil;
  detailKendala.textContent = entry.kendala || '-';
  historyDetail.classList.remove('hidden');
}

function renderProfile() {
  document.getElementById('display-name').textContent = state.profile.name;
  document.getElementById('display-id').textContent = state.profile.id;
  document.getElementById('display-university').textContent = state.profile.university;
  document.getElementById('display-study').textContent = state.profile.study;
  document.getElementById('display-period').textContent = state.profile.period;
  document.getElementById('display-mentor').textContent = state.profile.mentor;
  document.getElementById('display-email').textContent = state.profile.email;

  document.getElementById('profile-name').value = state.profile.name;
  document.getElementById('profile-id').value = state.profile.id;
  document.getElementById('profile-university').value = state.profile.university;
  document.getElementById('profile-study').value = state.profile.study;
  document.getElementById('profile-period').value = state.profile.period;
  document.getElementById('profile-mentor').value = state.profile.mentor;
}

function populateFormForEdit(entry, index) {
  form.tanggal.value = entry.tanggal;
  form.unit.value = entry.unit;
  form.jam.value = entry.jam;
  form.status.value = entry.status;
  document.getElementById('progress').value = entry.progress || 'Selesai';
  form.kegiatan.value = entry.kegiatan;
  form.hasil.value = entry.hasil;
  form.kendala.value = entry.kendala;
  form.dataset.editIndex = index;
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function saveEntry(entry) {
  if (typeof entry.index === 'number') {
    state.entries[entry.index] = entry;
  } else {
    state.entries.push(entry);
  }
  updateSummary();
  renderHistory();
  saveState();
  showSaveMessage('Entri berhasil disimpan.');
}

function showSaveMessage(message) {
  if (!saveMessage) return;
  saveMessage.textContent = message;
  saveMessage.classList.remove('hidden');
  setTimeout(() => {
    saveMessage.classList.add('hidden');
  }, 2500);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!state.currentUser) {
    showAuthMessage('Silakan masuk terlebih dahulu untuk menambahkan entri.', true);
    return;
  }

  const jamData = parseTimeRange(form.jam.value.trim());
  if (jamData.duration === 0 && form.jam.value.trim()) {
    alert('Format jam kerja tidak valid. Gunakan contoh: 08:00 - 16:00');
    return;
  }

  const entry = {
    tanggal: form.tanggal.value,
    unit: form.unit.value.trim(),
    jam: jamData.text,
    jamDuration: jamData.duration,
    status: form.status.value,
    progress: document.getElementById('progress').value,
    kegiatan: form.kegiatan.value.trim(),
    hasil: form.hasil.value.trim(),
    kendala: form.kendala.value.trim(),
  };

  const editingIndex = form.dataset.editIndex;
  if (editingIndex !== undefined && editingIndex !== null) {
    entry.index = Number(editingIndex);
    delete form.dataset.editIndex;
  }

  saveEntry(entry);
  form.reset();
});

historyBody.addEventListener('click', (event) => {
  const viewButton = event.target.closest('.view-button');
  if (viewButton) {
    state.selectedIndex = Number(viewButton.dataset.index);
    renderHistoryDetail();
    return;
  }

  const deleteButton = event.target.closest('.delete-button');
  if (deleteButton) {
    const indexToDelete = Number(deleteButton.dataset.index);
    const confirmed = window.confirm('Yakin ingin menghapus entri logbook ini?');
    if (!confirmed) return;

    state.entries.splice(indexToDelete, 1);
    if (state.selectedIndex === indexToDelete) {
      state.selectedIndex = null;
    } else if (state.selectedIndex !== null && state.selectedIndex > indexToDelete) {
      state.selectedIndex -= 1;
    }
    updateSummary();
    renderHistory();
    renderHistoryDetail();
    saveState();
  }
});

// Profile Edit Toggle Handlers
const toggleEditProfileBtn = document.getElementById('toggle-edit-profile');
const cancelEditProfileBtn = document.getElementById('cancel-edit-profile');
const profileDisplayView = document.getElementById('profile-display-view');
const profileEditView = document.getElementById('profile-edit-view');

if (toggleEditProfileBtn) {
  toggleEditProfileBtn.addEventListener('click', () => {
    profileDisplayView.classList.add('hidden');
    profileEditView.classList.remove('hidden');
  });
}

if (cancelEditProfileBtn) {
  cancelEditProfileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    profileDisplayView.classList.remove('hidden');
    profileEditView.classList.add('hidden');
  });
}

const profileForm = document.getElementById('profile-form');
profileForm.addEventListener('submit', (event) => {
  event.preventDefault();

  state.profile = {
    name: document.getElementById('profile-name').value.trim() || state.profile.name,
    id: document.getElementById('profile-id').value.trim() || state.profile.id,
    university: document.getElementById('profile-university').value.trim() || state.profile.university,
    study: document.getElementById('profile-study').value.trim() || state.profile.study,
    period: document.getElementById('profile-period').value.trim() || state.profile.period,
    mentor: document.getElementById('profile-mentor').value.trim() || state.profile.mentor,
    email: document.getElementById('profile-email').value.trim() || state.profile.email,
  };

  renderProfile();
  profileDisplayView.classList.remove('hidden');
  profileEditView.classList.add('hidden');
  saveState();
  showToast('Profil berhasil disimpan!');
});

loadState();
loadAuthState();
if (state.currentUser) {
  showMainApp();
} else {
  showLoginScreen();
}

if (loginTab) {
  loginTab.addEventListener('click', () => switchAuthTab(false));
}
if (signupTab) {
  signupTab.addEventListener('click', () => switchAuthTab(true));
}
if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}
if (signupForm) {
  signupForm.addEventListener('submit', handleSignup);
}
if (logoutButton) {
  logoutButton.addEventListener('click', handleLogout);
}

if (toggleLoginPassword) {
  toggleLoginPassword.addEventListener('click', () => togglePasswordVisibility(loginPassword, toggleLoginPassword));
}
if (toggleSignupPassword) {
  toggleSignupPassword.addEventListener('click', () => togglePasswordVisibility(signupPassword, toggleSignupPassword));
}
if (toggleSignupConfirmPassword) {
  toggleSignupConfirmPassword.addEventListener('click', () => togglePasswordVisibility(signupConfirmPassword, toggleSignupConfirmPassword));
}

function addFilterListeners() {
  [historyStatusFilter, historyProgressFilter, historyDateFrom, historyDateTo].forEach((filter) => {
    if (filter) {
      filter.addEventListener('change', () => {
        state.selectedIndex = null;
        renderHistory();
        renderHistoryDetail();
      });
    }
  });

  if (historySearch) {
    historySearch.addEventListener('input', () => {
      state.selectedIndex = null;
      renderHistory();
      renderHistoryDetail();
    });
  }

  if (historyResetButton) {
    historyResetButton.addEventListener('click', () => {
      if (historyStatusFilter) historyStatusFilter.value = 'all';
      if (historyProgressFilter) historyProgressFilter.value = 'all';
      if (historyDateFrom) historyDateFrom.value = '';
      if (historyDateTo) historyDateTo.value = '';
      if (historySearch) historySearch.value = '';
      state.selectedIndex = null;
      renderHistory();
      renderHistoryDetail();
    });
  }
}

if (detailCloseButton) {
  detailCloseButton.addEventListener('click', () => {
    state.selectedIndex = null;
    renderHistoryDetail();
  });
}

if (detailEditButton) {
  detailEditButton.addEventListener('click', () => {
    if (state.selectedIndex === null) return;
    const entry = state.entries[state.selectedIndex];
    populateFormForEdit(entry, state.selectedIndex);
  });
}

addFilterListeners();
renderHistory();
updateSummary();
renderProfile();
renderHistoryDetail();
