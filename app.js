const STORAGE_KEY = "creativityLabEntries";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const form = $("#entryForm");
const entryId = $("#entryId");
const entryDate = $("#entryDate");
const energy = $("#energy");
const tags = $("#tags");
const ordinary = $("#ordinary");
const exaggerated = $("#exaggerated");
const connection = $("#connection");
const tinyOutput = $("#tinyOutput");
const formStatus = $("#formStatus");
const historyList = $("#historyList");
const emptyStateTemplate = $("#emptyStateTemplate");
const searchEntries = $("#searchEntries");
const sortEntries = $("#sortEntries");
const entryDialog = $("#entryDialog");
const dialogContent = $("#dialogContent");

const sparkData = [
  {
    notice: "A receipt curled like a sleepy shrimp.",
    exaggerate: "A financial document attempting interpretive dance.",
    connect: "Connect it to ambition.",
    output: "Write one sentence about a goal that changed shape after you touched it."
  },
  {
    notice: "A traffic light taking forever to change.",
    exaggerate: "A tiny dictator in red, governing everyone’s patience.",
    connect: "Connect it to friendship.",
    output: "Create a joke about waiting for someone who is emotionally stuck at amber."
  },
  {
    notice: "A spoon left inside a mug.",
    exaggerate: "A metal lighthouse in a sea of forgotten tea.",
    connect: "Connect it to courage.",
    output: "Sketch or describe something small standing upright inside something overwhelming."
  },
  {
    notice: "A bag strap twisted on someone’s shoulder.",
    exaggerate: "A daily inconvenience doing advanced gymnastics.",
    connect: "Connect it to communication.",
    output: "Write a question about what gets twisted when nobody checks in."
  },
  {
    notice: "An elevator mirror with fingerprints.",
    exaggerate: "A public portrait gallery curated by anxious thumbs.",
    connect: "Connect it to memory.",
    output: "Write one line about the marks people leave without meaning to."
  },
  {
    notice: "A plant leaning toward a window.",
    exaggerate: "A dramatic green philosopher chasing the sun like rent is due.",
    connect: "Connect it to discipline.",
    output: "Create a tiny mantra about growing in the direction of evidence."
  }
];

function getEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error("Could not parse saved entries", error);
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function uid() {
  return crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function dateBits(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return {
    month: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
    day: new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date)
  };
}

function routeTo(route) {
  const targetRoute = route || "today";
  $$(".page").forEach((page) => page.classList.toggle("is-active", page.id === targetRoute));
  $$(".tab").forEach((tab) => tab.classList.toggle("is-active", tab.dataset.route === targetRoute));
  window.location.hash = targetRoute;
  if (targetRoute === "history") renderHistory();
}

function clearFormFields() {
  entryId.value = "";
  form.reset();
  entryDate.value = todayISO();
  form.querySelector("button[type='submit']").textContent = "Save entry";
  formStatus.textContent = "";
}

function getFormEntry() {
  return {
    id: entryId.value || uid(),
    date: entryDate.value,
    energy: energy.value.trim(),
    tags: tags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    ordinary: ordinary.value.trim(),
    exaggerated: exaggerated.value.trim(),
    connection: connection.value.trim(),
    tinyOutput: tinyOutput.value.trim(),
    updatedAt: new Date().toISOString()
  };
}

function fillForm(entry) {
  routeTo("today");
  entryId.value = entry.id;
  entryDate.value = entry.date;
  energy.value = entry.energy || "";
  tags.value = (entry.tags || []).join(", ");
  ordinary.value = entry.ordinary || "";
  exaggerated.value = entry.exaggerated || "";
  connection.value = entry.connection || "";
  tinyOutput.value = entry.tinyOutput || "";
  form.querySelector("button[type='submit']").textContent = "Update entry";
  formStatus.textContent = "Editing saved entry.";
  ordinary.focus();
}

function saveEntry(event) {
  event.preventDefault();
  const nextEntry = getFormEntry();
  const entries = getEntries();
  const existingIndex = entries.findIndex((entry) => entry.id === nextEntry.id);

  if (existingIndex >= 0) {
    entries[existingIndex] = nextEntry;
    formStatus.textContent = "Entry updated. Polite confetti: ✦ ✦ ✦";
  } else {
    entries.unshift({ ...nextEntry, createdAt: new Date().toISOString() });
    formStatus.textContent = "Saved. Your tiny idea has entered the vault.";
  }

  saveEntries(entries);
  entryId.value = nextEntry.id;
  form.querySelector("button[type='submit']").textContent = "Update entry";
  renderHistory();
}

function deleteEntry(id) {
  const shouldDelete = confirm("Delete this entry? The tiny goblin cannot undo this.");
  if (!shouldDelete) return;

  const entries = getEntries().filter((entry) => entry.id !== id);
  saveEntries(entries);
  renderHistory();

  if (entryId.value === id) clearFormFields();
}

function viewEntry(id) {
  const entry = getEntries().find((item) => item.id === id);
  if (!entry) return;

  dialogContent.innerHTML = `
    <article class="dialog-entry">
      <p class="eyebrow">${escapeHTML(formatDate(entry.date))}</p>
      <h3>${escapeHTML(entry.tinyOutput)}</h3>
      <dl>
        <div>
          <dt>Ordinary thing</dt>
          <dd>${escapeHTML(entry.ordinary)}</dd>
        </div>
        <div>
          <dt>Exaggerated description</dt>
          <dd>${escapeHTML(entry.exaggerated)}</dd>
        </div>
        <div>
          <dt>Unrelated connection</dt>
          <dd>${escapeHTML(entry.connection)}</dd>
        </div>
        ${entry.energy ? `<div><dt>Energy</dt><dd>${escapeHTML(entry.energy)}</dd></div>` : ""}
      </dl>
      ${renderTags(entry.tags)}
    </article>
  `;

  entryDialog.showModal();
}

function renderTags(tagList = []) {
  if (!tagList.length) return "";
  return `<div class="tags">${tagList.map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}</div>`;
}

function renderHistory() {
  const query = searchEntries.value.trim().toLowerCase();
  const sortMode = sortEntries.value;
  let entries = getEntries();

  if (query) {
    entries = entries.filter((entry) => {
      const haystack = [
        entry.date,
        entry.energy,
        entry.ordinary,
        entry.exaggerated,
        entry.connection,
        entry.tinyOutput,
        ...(entry.tags || [])
      ].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }

  entries.sort((a, b) => {
    const diff = new Date(b.date) - new Date(a.date);
    return sortMode === "newest" ? diff : -diff;
  });

  historyList.innerHTML = "";

  if (!entries.length) {
    historyList.append(emptyStateTemplate.content.cloneNode(true));
    return;
  }

  historyList.innerHTML = entries.map((entry) => {
    const bits = dateBits(entry.date);
    return `
      <article class="history-card">
        <div class="history-date" aria-label="${escapeHTML(formatDate(entry.date))}">
          <span>${escapeHTML(bits.month)}</span>
          <span>${escapeHTML(bits.day)}</span>
        </div>
        <div class="history-body">
          <h3>${escapeHTML(entry.tinyOutput)}</h3>
          <p><strong>Ordinary:</strong> ${escapeHTML(entry.ordinary)}</p>
          <p><strong>Exaggerated:</strong> ${escapeHTML(entry.exaggerated)}</p>
          <p><strong>Connection:</strong> ${escapeHTML(entry.connection)}</p>
          ${renderTags(entry.tags)}
        </div>
        <div class="card-actions">
          <button class="icon-button" title="View entry" data-action="view" data-id="${entry.id}">👁</button>
          <button class="icon-button" title="Edit entry" data-action="edit" data-id="${entry.id}">✎</button>
          <button class="icon-button" title="Delete entry" data-action="delete" data-id="${entry.id}">×</button>
        </div>
      </article>
    `;
  }).join("");
}

function exportEntries() {
  const entries = getEntries();
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `creativity-lab-entries-${todayISO()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function deleteAllEntries() {
  if (!getEntries().length) return;
  const shouldDelete = confirm("Delete every entry? This is the dramatic option.");
  if (!shouldDelete) return;
  saveEntries([]);
  clearFormFields();
  renderHistory();
}

function newSpark() {
  const spark = sparkData[Math.floor(Math.random() * sparkData.length)];
  $("#sparkNotice").textContent = spark.notice;
  $("#sparkExaggerate").textContent = spark.exaggerate;
  $("#sparkConnect").textContent = spark.connect;
  $("#sparkOutput").textContent = spark.output;
}

function bindEvents() {
  $$("[data-route]").forEach((button) => {
    button.addEventListener("click", () => routeTo(button.dataset.route));
  });

  form.addEventListener("submit", saveEntry);
  $("#clearForm").addEventListener("click", clearFormFields);
  $("#exportEntries").addEventListener("click", exportEntries);
  $("#deleteAll").addEventListener("click", deleteAllEntries);
  searchEntries.addEventListener("input", renderHistory);
  sortEntries.addEventListener("change", renderHistory);
  $("#newSpark").addEventListener("click", newSpark);

  historyList.addEventListener("click", (event) => {
    const routeButton = event.target.closest("button[data-route]");
    if (routeButton) {
      routeTo(routeButton.dataset.route);
      return;
    }

    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;
    const entry = getEntries().find((item) => item.id === id);

    if (action === "view") viewEntry(id);
    if (action === "edit" && entry) fillForm(entry);
    if (action === "delete") deleteEntry(id);
  });

  window.addEventListener("hashchange", () => routeTo(window.location.hash.replace("#", "") || "today"));
}

function init() {
  entryDate.value = todayISO();
  bindEvents();
  newSpark();
  routeTo(window.location.hash.replace("#", "") || "today");
}

init();
