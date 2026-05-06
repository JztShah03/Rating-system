"use strict";

const CONFIG = {
  googleScriptUrl: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE",
  thankYouRedirectSeconds: 5,
  minimumAnimationMs: 1150,
  localStorageKeys: {
    selectedTechnicianId: "rss_selected_technician_id",
    adminToken: "rss_admin_token"
  }
};

const TECHNICIANS = [
  { id: "ahmad", name: "Ahmad", image: "assets/technician1.jpg", role: "Service Technician" },
  { id: "hafiz", name: "Hafiz", image: "assets/technician2.jpg", role: "Service Technician" },
  { id: "danial", name: "Danial", image: "assets/technician3.jpg", role: "Service Technician" },
  { id: "faris", name: "Faris", image: "assets/technician4.jpg", role: "Service Technician" },
  { id: "azlan", name: "Azlan", image: "assets/technician5.jpg", role: "Service Technician" },
  { id: "irfan", name: "Irfan", image: "assets/technician6.jpg", role: "Service Technician" },
  { id: "imran", name: "Imran", image: "assets/technician7.jpg", role: "Service Technician" },
  { id: "zaid", name: "Zaid", image: "assets/technician8.jpg", role: "Service Technician" },
  { id: "nabil", name: "Nabil", image: "assets/technician9.jpg", role: "Service Technician" },
  { id: "syafiq", name: "Syafiq", image: "assets/technician10.jpg", role: "Service Technician" },
  { id: "aiman", name: "Aiman", image: "assets/technician11.jpg", role: "Service Technician" },
  { id: "hakim", name: "Hakim", image: "assets/technician12.jpg", role: "Service Technician" }
];

const RATING_OPTIONS = [
  { value: 1, label: "Very Unsatisfied", emoji: "😡", color: "#ef4444" },
  { value: 2, label: "Unsatisfied", emoji: "😕", color: "#f97316" },
  { value: 3, label: "Neutral", emoji: "😐", color: "#facc15" },
  { value: 4, label: "Satisfied", emoji: "🙂", color: "#84cc16" },
  { value: 5, label: "Excellent", emoji: "😍", color: "#22c55e" }
];

const appState = {
  selectedTechnician: null,
  isSubmitting: false,
  lastPendingRating: null,
  adminRows: []
};

document.addEventListener("DOMContentLoaded", () => {
  setupBackButtons();

  const page = document.body.dataset.page;
  if (page === "index") initTechnicianSelectionPage();
  if (page === "rating") initRatingPage();
  if (page === "thankYou") initThankYouPage();
  if (page === "admin") initAdminDashboard();
});

function setupBackButtons() {
  document.querySelectorAll("[data-back-home]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  });

  document.querySelectorAll("[data-back-rating]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = getRatingPageUrl();
    });
  });
}

function initTechnicianSelectionPage() {
  const grid = document.getElementById("technicianGrid");
  if (!grid) return;

  grid.innerHTML = TECHNICIANS.map((technician) => `
    <button class="technician-card" type="button" data-technician-id="${escapeHtml(technician.id)}" aria-label="Select ${escapeHtml(technician.name)}">
      <span class="technician-photo-wrap">
        <img class="technician-photo" src="${escapeHtml(technician.image)}" alt="${escapeHtml(technician.name)} photo" loading="lazy">
      </span>
      <span>
        <span class="technician-name">${escapeHtml(technician.name)}</span>
        <span class="technician-role">${escapeHtml(technician.role)}</span>
      </span>
    </button>
  `).join("");

  grid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-technician-id]");
    if (!card) return;
    const technicianId = card.dataset.technicianId;
    selectTechnician(technicianId);
  });
}

function selectTechnician(technicianId) {
  const technician = findTechnician(technicianId);
  if (!technician) return;

  localStorage.setItem(CONFIG.localStorageKeys.selectedTechnicianId, technician.id);
  window.location.href = `rating.html?technician=${encodeURIComponent(technician.id)}`;
}

function initRatingPage() {
  const technician = getSelectedTechnician();
  const selectedTechnicianContainer = document.getElementById("selectedTechnician");
  const ratingOptionsContainer = document.getElementById("ratingOptions");
  const retryButton = document.getElementById("retryButton");

  if (!selectedTechnicianContainer || !ratingOptionsContainer) return;

  if (!technician) {
    selectedTechnicianContainer.innerHTML = `
      <strong>No technician selected</strong>
      <span>Please return to the selection page.</span>
    `;
    ratingOptionsContainer.innerHTML = `
      <div class="empty-state">Technician data is missing. Please go back and choose a technician.</div>
    `;
    setStatus("Choose a technician before submitting a rating.", "error");
    return;
  }

  appState.selectedTechnician = technician;
  selectedTechnicianContainer.innerHTML = `
    <img src="${escapeHtml(technician.image)}" alt="${escapeHtml(technician.name)} photo">
    <span>
      <strong>${escapeHtml(technician.name)}</strong>
      <span>${escapeHtml(technician.role)}</span>
    </span>
  `;

  ratingOptionsContainer.innerHTML = RATING_OPTIONS.map((rating) => `
    <button class="rating-option" type="button" data-rating-value="${rating.value}" style="--rating-color: ${rating.color}" aria-label="${escapeHtml(rating.label)} rating">
      <span class="rating-emoji" aria-hidden="true">${rating.emoji}</span>
      <span class="rating-label">${escapeHtml(rating.label)}</span>
    </button>
  `).join("");

  ratingOptionsContainer.addEventListener("click", handleRatingClick);
  retryButton?.addEventListener("click", () => {
    if (appState.lastPendingRating && !appState.isSubmitting) {
      submitSelectedRating(appState.lastPendingRating, null);
    }
  });
}

async function handleRatingClick(event) {
  const button = event.target.closest("[data-rating-value]");
  if (!button || appState.isSubmitting) return;

  const ratingValue = Number(button.dataset.ratingValue);
  const rating = RATING_OPTIONS.find((item) => item.value === ratingValue);
  if (!rating || !appState.selectedTechnician) return;

  document.querySelectorAll(".rating-option").forEach((option) => option.classList.remove("is-selected"));
  button.classList.add("is-selected");
  createEmojiBurst(rating.emoji, button);
  await submitSelectedRating(rating, button);
}

async function submitSelectedRating(rating, sourceButton) {
  if (appState.isSubmitting) return;
  appState.isSubmitting = true;
  appState.lastPendingRating = rating;

  setRatingButtonsDisabled(true);
  setStatus(`<span class="status-inline"><span class="spinner" aria-hidden="true"></span>Saving your feedback...</span>`);
  toggleRetry(false);

  const payload = buildRatingPayload(appState.selectedTechnician, rating);
  const startedAt = Date.now();

  try {
    await saveRating(payload);
    const elapsed = Date.now() - startedAt;
    await wait(Math.max(CONFIG.minimumAnimationMs - elapsed, 0));

    setStatus("Saved successfully. Redirecting...", "success");
    const technicianId = encodeURIComponent(appState.selectedTechnician.id);
    window.location.href = `thank-you.html?technician=${technicianId}`;
  } catch (error) {
    console.error(error);
    appState.isSubmitting = false;
    setRatingButtonsDisabled(false);
    sourceButton?.classList.remove("is-selected");
    setStatus(getFriendlySubmissionError(error), "error");
    toggleRetry(true);
  }
}

function buildRatingPayload(technician, rating) {
  return {
    action: "addRating",
    submittedAt: new Date().toISOString(),
    technicianId: technician.id,
    technicianName: technician.name,
    ratingValue: rating.value,
    ratingLabel: rating.label,
    emojiSelected: rating.emoji,
    submissionId: generateSubmissionId(),
    userAgent: navigator.userAgent,
    source: window.location.href
  };
}

async function saveRating(payload) {
  ensureGoogleScriptConfigured();

  const response = await fetch(CONFIG.googleScriptUrl, {
    method: "POST",
    mode: "cors",
    cache: "no-store",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  const data = await parseJsonResponse(response);
  if (!response.ok || !data.ok) {
    throw new Error(data.message || `Submission failed with status ${response.status}`);
  }

  return data;
}

function ensureGoogleScriptConfigured() {
  if (!CONFIG.googleScriptUrl || CONFIG.googleScriptUrl.includes("PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE")) {
    throw new Error("Google Apps Script URL is not configured yet.");
  }
}

async function parseJsonResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("The server returned an invalid response. Check your Apps Script deployment permissions.");
  }
}

function setRatingButtonsDisabled(isDisabled) {
  document.querySelectorAll(".rating-option").forEach((button) => {
    button.disabled = isDisabled;
  });
}

function setStatus(message, type = "default") {
  const status = document.getElementById("submissionStatus") || document.getElementById("adminStatus");
  if (!status) return;

  status.classList.toggle("is-error", type === "error");
  status.classList.toggle("is-success", type === "success");
  status.innerHTML = message || "";
}

function toggleRetry(show) {
  document.getElementById("retryButton")?.classList.toggle("is-hidden", !show);
}

function getFriendlySubmissionError(error) {
  const message = error?.message || "Unknown error";
  if (message.includes("not configured")) {
    return "Google Sheets is not connected yet. Add your Apps Script Web App URL in script.js, then try again.";
  }
  if (message.includes("Failed to fetch")) {
    return "Could not reach Google Sheets. Check your internet connection, Apps Script deployment access, and Web App URL.";
  }
  return `Could not save your feedback: ${escapeHtml(message)}. Please retry.`;
}

function createEmojiBurst(emoji, sourceElement) {
  const layer = document.getElementById("burstLayer");
  if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const rect = sourceElement?.getBoundingClientRect?.();
  const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  const particles = [emoji, emoji, emoji, "✨", "⭐", "💫", "🎉"];
  const particleCount = 34;

  for (let i = 0; i < particleCount; i += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * i) / particleCount + randomBetween(-0.25, 0.25);
    const distance = randomBetween(70, 185);
    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance - randomBetween(8, 38);

    particle.className = "burst-particle";
    particle.textContent = particles[Math.floor(Math.random() * particles.length)];
    particle.style.setProperty("--origin-x", `${originX}px`);
    particle.style.setProperty("--origin-y", `${originY}px`);
    particle.style.setProperty("--move-x", `${moveX}px`);
    particle.style.setProperty("--move-y", `${moveY}px`);
    particle.style.setProperty("--rotate", `${randomBetween(-180, 180)}deg`);
    particle.style.setProperty("--size", `${randomBetween(18, 34)}px`);
    particle.style.setProperty("--duration", `${randomBetween(740, 1180)}ms`);

    layer.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
  }
}

function initThankYouPage() {
  const countdownText = document.getElementById("countdownText");
  const progress = document.getElementById("countdownProgress");
  const selectedTechnician = getSelectedTechnician();
  let remaining = CONFIG.thankYouRedirectSeconds;

  updateCountdown();
  const timer = window.setInterval(() => {
    remaining -= 1;
    updateCountdown();
    if (remaining <= 0) {
      window.clearInterval(timer);
      window.location.href = getRatingPageUrl(selectedTechnician);
    }
  }, 1000);

  function updateCountdown() {
    if (countdownText) {
      countdownText.textContent = `Redirecting in ${remaining} second${remaining === 1 ? "" : "s"}...`;
    }
    if (progress) {
      const percent = Math.max((remaining / CONFIG.thankYouRedirectSeconds) * 100, 0);
      progress.style.width = `${percent}%`;
    }
  }
}

async function initAdminDashboard() {
  const refreshButton = document.getElementById("refreshAdmin");
  const tokenInput = document.getElementById("adminTokenInput");
  const saveTokenButton = document.getElementById("saveTokenButton");
  const urlToken = new URLSearchParams(window.location.search).get("adminToken");
  const savedToken = localStorage.getItem(CONFIG.localStorageKeys.adminToken) || "";

  if (tokenInput) tokenInput.value = urlToken || savedToken;

  refreshButton?.addEventListener("click", () => loadAdminData());
  saveTokenButton?.addEventListener("click", () => {
    const token = tokenInput?.value?.trim() || "";
    localStorage.setItem(CONFIG.localStorageKeys.adminToken, token);
    setStatus("Admin token saved locally in this browser.", "success");
    loadAdminData();
  });

  await loadAdminData();
  window.addEventListener("resize", debounce(() => renderAdminDashboard(appState.adminRows), 160));
}

async function loadAdminData() {
  setStatus(`<span class="status-inline"><span class="spinner" aria-hidden="true"></span>Loading dashboard data...</span>`);

  try {
    ensureGoogleScriptConfigured();
    const tokenInput = document.getElementById("adminTokenInput");
    const adminToken = tokenInput?.value?.trim() || localStorage.getItem(CONFIG.localStorageKeys.adminToken) || "";
    const url = new URL(CONFIG.googleScriptUrl);
    url.searchParams.set("action", "getRatings");
    if (adminToken) url.searchParams.set("adminToken", adminToken);

    const response = await fetch(url.toString(), { method: "GET", cache: "no-store", mode: "cors" });
    const data = await parseJsonResponse(response);
    if (!response.ok || !data.ok) {
      throw new Error(data.message || `Dashboard load failed with status ${response.status}`);
    }

    appState.adminRows = normalizeRatingRows(data.ratings || []);
    setStatus(`Loaded ${appState.adminRows.length} rating record${appState.adminRows.length === 1 ? "" : "s"}.`, "success");
    renderAdminDashboard(appState.adminRows);
  } catch (error) {
    console.error(error);
    setStatus(getFriendlyAdminError(error), "error");
    renderAdminDashboard([]);
  }
}

function getFriendlyAdminError(error) {
  const message = error?.message || "Unknown error";
  if (message.includes("not configured")) {
    return "Dashboard is not connected yet. Paste your Apps Script Web App URL into CONFIG.googleScriptUrl in script.js.";
  }
  if (message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("token")) {
    return "Admin access was rejected. Check the admin token set in Apps Script Properties and try again.";
  }
  if (message.includes("Failed to fetch")) {
    return "Could not load Google Sheets data. Check internet access, Web App deployment permissions, and the URL.";
  }
  return `Could not load dashboard data: ${escapeHtml(message)}`;
}

function renderAdminDashboard(rows) {
  const stats = calculateStats(rows);
  renderMetrics(stats);
  renderAverageChart(document.getElementById("averageChart"), stats.technicians);
  renderDistributionChart(document.getElementById("distributionChart"), stats.overallDistribution);
  renderDistributionLegend(stats.overallDistribution);
  renderTechnicianDistribution(stats.technicians);
  renderRecentRecords(stats.recentRows);
}

function calculateStats(rows) {
  const technicians = TECHNICIANS.map((technician) => ({
    ...technician,
    count: 0,
    total: 0,
    average: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  }));

  const fallbackById = new Map(technicians.map((tech) => [tech.id, tech]));
  const overallDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  rows.forEach((row) => {
    const ratingValue = Number(row.ratingValue);
    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) return;

    let technician = fallbackById.get(row.technicianId);
    if (!technician) {
      technician = {
        id: row.technicianId || `unknown-${fallbackById.size + 1}`,
        name: row.technicianName || "Unknown Technician",
        image: "",
        role: "Service Technician",
        count: 0,
        total: 0,
        average: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
      technicians.push(technician);
      fallbackById.set(technician.id, technician);
    }

    technician.count += 1;
    technician.total += ratingValue;
    technician.distribution[ratingValue] += 1;
    overallDistribution[ratingValue] += 1;
  });

  technicians.forEach((technician) => {
    technician.average = technician.count ? technician.total / technician.count : 0;
  });

  const ratedTechnicians = technicians.filter((technician) => technician.count > 0);
  const best = ratedTechnicians.length
    ? ratedTechnicians.reduce((winner, item) => item.average > winner.average ? item : winner, ratedTechnicians[0])
    : null;
  const lowest = ratedTechnicians.length
    ? ratedTechnicians.reduce((loser, item) => item.average < loser.average ? item : loser, ratedTechnicians[0])
    : null;

  const recentRows = [...rows]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 12);

  return {
    totalRatings: rows.length,
    technicians,
    overallDistribution,
    best,
    lowest,
    recentRows
  };
}

function renderMetrics(stats) {
  const metricGrid = document.getElementById("metricGrid");
  if (!metricGrid) return;

  const ratedTechnicianCount = stats.technicians.filter((tech) => tech.count > 0).length;
  const systemAverage = stats.totalRatings
    ? stats.technicians.reduce((sum, tech) => sum + tech.total, 0) / stats.totalRatings
    : 0;

  const metrics = [
    {
      label: "Total Ratings",
      value: stats.totalRatings,
      subtext: `${ratedTechnicianCount} technician${ratedTechnicianCount === 1 ? "" : "s"} rated`
    },
    {
      label: "Overall Average",
      value: systemAverage ? systemAverage.toFixed(2) : "—",
      subtext: "Out of 5.00"
    },
    {
      label: "Best Performer",
      value: stats.best ? stats.best.name : "—",
      subtext: stats.best ? `${stats.best.average.toFixed(2)} average from ${stats.best.count} rating${stats.best.count === 1 ? "" : "s"}` : "No ratings yet"
    },
    {
      label: "Lowest Performer",
      value: stats.lowest ? stats.lowest.name : "—",
      subtext: stats.lowest ? `${stats.lowest.average.toFixed(2)} average from ${stats.lowest.count} rating${stats.lowest.count === 1 ? "" : "s"}` : "No ratings yet"
    }
  ];

  metricGrid.innerHTML = metrics.map((metric) => `
    <article class="metric-card">
      <div class="metric-label">${escapeHtml(metric.label)}</div>
      <div class="metric-value">${escapeHtml(String(metric.value))}</div>
      <div class="metric-subtext">${escapeHtml(metric.subtext)}</div>
    </article>
  `).join("");
}

function renderAverageChart(canvas, technicians) {
  if (!canvas) return;

  const ctx = setupCanvas(canvas);
  const { width, height } = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, width, height);

  const hasManyTechnicians = technicians.length > 8;
  const padding = { top: 24, right: 24, bottom: hasManyTechnicians ? 78 : 54, left: 42 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = 5;

  drawCanvasText(ctx, "5", 13, padding.left - 18, padding.top + 4, "#6b7280", "right");
  drawCanvasText(ctx, "0", 13, padding.left - 18, padding.top + chartHeight, "#6b7280", "right");

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i += 1) {
    const y = padding.top + chartHeight - (chartHeight * i) / 5;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  const gap = technicians.length > 8 ? 10 : 18;
  const barWidth = Math.max((chartWidth - gap * (technicians.length - 1)) / technicians.length, technicians.length > 8 ? 12 : 20);

  technicians.forEach((technician, index) => {
    const x = padding.left + index * (barWidth + gap);
    const barHeight = technician.average ? (technician.average / maxValue) * chartHeight : 0;
    const y = padding.top + chartHeight - barHeight;

    const gradient = ctx.createLinearGradient(0, y, 0, padding.top + chartHeight);
    gradient.addColorStop(0, "#2563eb");
    gradient.addColorStop(1, "#93c5fd");

    roundedRect(ctx, x, y, barWidth, barHeight, 10, gradient);
    drawCanvasText(ctx, technician.average ? technician.average.toFixed(2) : "—", 13, x + barWidth / 2, y - 8, "#111827", "center", 800);

    if (hasManyTechnicians) {
      ctx.save();
      ctx.translate(x + barWidth / 2, height - 24);
      ctx.rotate(-Math.PI / 4);
      drawCanvasText(ctx, technician.name, 11, 0, 0, "#4b5563", "right", 700);
      ctx.restore();
    } else {
      drawCanvasText(ctx, technician.name, 12, x + barWidth / 2, height - 24, "#4b5563", "center", 700);
    }
  });
}

function renderDistributionChart(canvas, distribution) {
  if (!canvas) return;

  const ctx = setupCanvas(canvas);
  const { width, height } = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, width, height);

  const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.36;
  const innerRadius = radius * 0.62;

  if (!total) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = radius - innerRadius;
    ctx.stroke();
    drawCanvasText(ctx, "No data", 18, centerX, centerY + 6, "#6b7280", "center", 800);
    return;
  }

  let startAngle = -Math.PI / 2;
  RATING_OPTIONS.forEach((rating) => {
    const value = distribution[rating.value] || 0;
    if (!value) return;

    const slice = (value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + slice);
    ctx.lineWidth = radius - innerRadius;
    ctx.strokeStyle = rating.color;
    ctx.stroke();
    startAngle += slice;
  });

  drawCanvasText(ctx, String(total), 26, centerX, centerY - 2, "#111827", "center", 900);
  drawCanvasText(ctx, "ratings", 13, centerX, centerY + 23, "#6b7280", "center", 700);
}

function renderDistributionLegend(distribution) {
  const legend = document.getElementById("distributionLegend");
  if (!legend) return;

  const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);
  legend.innerHTML = RATING_OPTIONS.map((rating) => {
    const count = distribution[rating.value] || 0;
    const percent = total ? Math.round((count / total) * 100) : 0;
    return `
      <div class="legend-item">
        <span class="legend-label"><span class="legend-dot" style="--dot-color:${rating.color}"></span>${rating.emoji} ${escapeHtml(rating.label)}</span>
        <strong>${count} (${percent}%)</strong>
      </div>
    `;
  }).join("");
}

function renderTechnicianDistribution(technicians) {
  const container = document.getElementById("technicianDistribution");
  if (!container) return;

  container.innerHTML = technicians.map((technician) => {
    const maxCount = Math.max(...Object.values(technician.distribution), 1);
    const rows = RATING_OPTIONS.map((rating) => {
      const count = technician.distribution[rating.value] || 0;
      const width = Math.round((count / maxCount) * 100);
      return `
        <div class="mini-bar-row">
          <span>${rating.emoji} ${rating.value} star</span>
          <span class="mini-bar-track"><span class="mini-bar-fill" style="--bar-width:${width}%; --bar-color:${rating.color}"></span></span>
          <strong>${count}</strong>
        </div>
      `;
    }).join("");

    return `
      <article class="distribution-card">
        <div class="distribution-title">
          <span>${escapeHtml(technician.name)}</span>
          <span class="muted">Avg ${technician.average ? technician.average.toFixed(2) : "—"}</span>
        </div>
        ${rows}
      </article>
    `;
  }).join("");
}

function renderRecentRecords(rows) {
  const tableBody = document.getElementById("recentRecords");
  if (!tableBody) return;

  if (!rows.length) {
    tableBody.innerHTML = `<tr><td colspan="5" class="empty-state">No rating records found yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = rows.map((row) => {
    const rating = RATING_OPTIONS.find((item) => item.value === Number(row.ratingValue));
    return `
      <tr>
        <td>${escapeHtml(formatDateTime(row.timestamp))}</td>
        <td>${escapeHtml(row.technicianName || "Unknown")}</td>
        <td><span class="rating-pill">${escapeHtml(row.emojiSelected || rating?.emoji || "")}&nbsp;${escapeHtml(String(row.ratingValue || "—"))}/5</span></td>
        <td>${escapeHtml(row.ratingLabel || rating?.label || "—")}</td>
        <td>${escapeHtml(row.emojiSelected || "—")}</td>
      </tr>
    `;
  }).join("");
}

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";
  return ctx;
}

function roundedRect(ctx, x, y, width, height, radius, fillStyle) {
  if (height <= 0) return;

  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function drawCanvasText(ctx, text, size, x, y, color, align = "left", weight = 700) {
  ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function normalizeRatingRows(rows) {
  return rows.map((row) => ({
    timestamp: row.Timestamp || row.timestamp || row.submittedAt || "",
    technicianId: row["Technician ID"] || row.technicianId || "",
    technicianName: row["Technician Name"] || row.technicianName || "",
    ratingValue: Number(row["Rating Value"] || row.ratingValue || 0),
    ratingLabel: row["Rating Label"] || row.ratingLabel || "",
    emojiSelected: row["Emoji Selected"] || row.emojiSelected || "",
    submissionId: row["Submission ID"] || row.submissionId || ""
  }));
}

function getSelectedTechnician() {
  const params = new URLSearchParams(window.location.search);
  const urlTechnicianId = params.get("technician");
  const savedTechnicianId = localStorage.getItem(CONFIG.localStorageKeys.selectedTechnicianId);
  const technicianId = urlTechnicianId || savedTechnicianId;

  if (urlTechnicianId) {
    localStorage.setItem(CONFIG.localStorageKeys.selectedTechnicianId, urlTechnicianId);
  }

  return findTechnician(technicianId);
}

function findTechnician(technicianId) {
  return TECHNICIANS.find((technician) => technician.id === technicianId) || null;
}

function getRatingPageUrl(technician = getSelectedTechnician()) {
  if (technician?.id) {
    return `rating.html?technician=${encodeURIComponent(technician.id)}`;
  }
  return "rating.html";
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function generateSubmissionId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function debounce(callback, delay) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), delay);
  };
}
